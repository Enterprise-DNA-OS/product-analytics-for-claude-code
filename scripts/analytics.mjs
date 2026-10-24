import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {table} from './lib/format.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const canonical=x=>Array.isArray(x)?`[${x.map(canonical).join(',')}]`:x&&typeof x==='object'?`{${Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')}}`:JSON.stringify(x);
const today=()=>new Date().toISOString().slice(0,10);
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}`);return o[k].trim();};
export function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Invalid date: ${s}`);return s;}
const integer=(v,min,max)=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`Expected integer ${min}..${max}`);return n;};
const tables=['projects','event_types','events','funnels','actions','imports','activity'];
export const specs={
 help:[],projects:[], 'show-project':[],'tracking-plan':[],'review-project':['owner','purpose','review-on'],events:[],daily:['from','to'],'active-users':['from','to'],'feature-adoption':['from','to'],flows:[],cohorts:[],retention:['days','through'],'quiet-users':['days','through'],quality:[],freshness:[],attention:[],compliance:[],actions:[],activity:[],funnels:[],funnel:['ref','from','to'],
 'add-project':['code','name','owner','purpose','review-on'],'set-rule':['event','owner','purpose','required','review-on'],
 'define-funnel':['code','name','steps','hours'],'add-action':['code','title','owner','due-on'],'close-action':['ref','evidence'],log:['note'],
 import:['file','dry-run'],export:['file'],'draft-review':[],'weekly-review':[]
};
export const commands=Object.keys(specs);
const writes=new Set(['add-project','set-rule','define-funnel','add-action','close-action','log','import','review-project']);
async function resolve(db,kind,ref,project){
 const rows=await db.query(`select * from ${kind} ${project?'where project_id=$1':''} order by ${kind==='actions'?'code':'name'}`,project?[project]:[]);
 const q=ref.toLowerCase();let hits=rows.filter(r=>r.code?.toLowerCase()===q||r.id===ref);
 if(!hits.length)hits=rows.filter(r=>r.id.startsWith(q)||String(r.name||r.title).toLowerCase().includes(q));
 if(hits.length!==1)throw Error(`${hits.length?'Ambiguous':'No'} ${kind} match: ${ref}\n${(hits.length?hits:rows).map(r=>`${r.code} ${r.name||r.title} ${r.id}`).join('\n')}`);
 return hits[0];
}
const log=async(db,id,actor,operation,details)=>db.query('insert into activity(project_id,actor,operation,details) values($1,$2,$3,$4)',[id,actor,operation,JSON.stringify(details)]);
async function transaction(db,fn,dry=false){await db.exec('BEGIN');try{const result=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
function range(o){const from=date(o.from||'1970-01-01'),to=date(o.to||today());if(from>to)throw Error('from must not follow to');return [from,to];}
export function parseExport(file){
 const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');const raw=text.trim().startsWith('[')?JSON.parse(text):text.split(/\r?\n/).filter(x=>x.trim()).map((x,i)=>{try{return JSON.parse(x);}catch{throw Error(`Invalid JSON on line ${i+1}`);}});
 if(!Array.isArray(raw)||!raw.length)throw Error('Export needs at least one event');
 const seen=new Map();let duplicates=0;
 for(const [i,r] of raw.entries()){
  const p=r?.properties;
  if(!r||typeof r.event!=='string'||!r.event.trim()||!p||typeof p!=='object'||Array.isArray(p))throw Error(`Invalid event at row ${i+1}`);
  if((typeof p.distinct_id!=='string'&&typeof p.distinct_id!=='number')||String(p.distinct_id).trim()==='')throw Error(`Missing distinct_id at row ${i+1}; identity merges must be resolved before import`);
  const timestamp=p.time;
  if(typeof timestamp!=='number'||!Number.isSafeInteger(timestamp)||timestamp<0||timestamp>Math.floor(Date.now()/1000))throw Error(`Invalid Unix seconds time at row ${i+1}`);
  if(p.$insert_id!==undefined&&(typeof p.$insert_id!=='string'||!p.$insert_id.trim()))throw Error(`Invalid $insert_id at row ${i+1}`);
  // Mixpanel's deduplication tuple includes event, identity, time and insert ID.
  const key=p.$insert_id?hash(canonical([r.event,String(p.distinct_id),timestamp,p.$insert_id])):hash(canonical(r));
  if(seen.has(key)){if(canonical(seen.get(key).raw)!==canonical(r))throw Error(`Conflicting duplicate at row ${i+1}`);duplicates++;continue;}
  seen.set(key,{key,event:r.event,person:String(p.distinct_id),at:new Date(timestamp*1000).toISOString(),properties:p,raw:r});
 }
 return {records:[...seen.values()],duplicates,digest:hash(text),rows:raw.length};
}
export async function run(db,cmd,o={},args=[]){
 if(!commands.includes(cmd))throw Error(`Unknown command: ${cmd}`);
 for(const key of Object.keys(o))if(![...specs[cmd],'project','actor','json'].includes(key))throw Error(`Unknown --${key} for ${cmd}`);
 if(cmd!=='import'&&args.length)throw Error('Unexpected positional arguments');
 if(cmd==='help')return commands.map(command=>({command,options:specs[command].join(', '),scope:['help','projects','add-project'].includes(command)?'global':'--project required'}));
 if(cmd==='projects')return db.query('select code,name,owner,purpose,review_on from projects order by code');
 const actor=writes.has(cmd)?required(o,'actor'):null;
 if(cmd==='add-project')return transaction(db,async()=>{
  const rows=await db.query('insert into projects(code,name,owner,purpose,review_on) values($1,$2,$3,$4,$5) returning id,code,name',[required(o,'code'),required(o,'name'),required(o,'owner'),required(o,'purpose'),date(required(o,'review-on'))]);
  await log(db,rows[0].id,actor,cmd,{code:o.code});return rows;
 });
 const p=await resolve(db,'projects',required(o,'project'));const id=p.id;
 if(cmd==='show-project')return [p];
 if(cmd==='tracking-plan')return db.query('select name,owner,purpose,required_properties,review_on from event_types where project_id=$1 order by name',[id]);
 if(cmd==='review-project')return transaction(db,async()=>{const rows=await db.query('update projects set owner=$2,purpose=$3,review_on=$4 where id=$1 returning code,owner,purpose,review_on',[id,required(o,'owner'),required(o,'purpose'),date(required(o,'review-on'))]);await log(db,id,actor,cmd,{before:{owner:p.owner,purpose:p.purpose,review_on:p.review_on},after:rows});return rows;});
 if(cmd==='events')return db.query('select event_name,count(*)::int events,count(distinct distinct_id)::int users from events where project_id=$1 group by 1 order by 1',[id]);
 if(cmd==='daily'){const [from,to]=range(o);return db.query('select day,event_name,events,users from daily_usage where project_id=$1 and day between $2 and $3 order by day,event_name',[id,from,to]);}
 if(cmd==='active-users'){const [from,to]=range(o);return db.query("select $2::date from_date,$3::date to_date,count(distinct distinct_id)::int active_users,count(*)::int events from events where project_id=$1 and occurred_at >= $2::date and occurred_at < $3::date+interval '1 day'",[id,from,to]);}
 if(cmd==='feature-adoption'){const [from,to]=range(o);return db.query("with e as(select * from events where project_id=$1 and occurred_at >= $2::date and occurred_at < $3::date+interval '1 day') select event_name,count(distinct distinct_id)::int users,round(100.0*count(distinct distinct_id)/nullif((select count(distinct distinct_id) from e),0),2) adoption_percent from e group by 1 order by 1",[id,from,to]);}
 if(cmd==='flows')return db.query("with seq as(select distinct_id,event_name,occurred_at,lead(event_name) over(partition by distinct_id order by occurred_at,source_key) next_event,lead(occurred_at) over(partition by distinct_id order by occurred_at,source_key) next_at from events where project_id=$1) select event_name,next_event,count(*)::int transitions from seq where next_event is not null and next_at>occurred_at group by 1,2 order by 3 desc,1,2",[id]);
 if(cmd==='cohorts')return db.query("with firsts as(select distinct_id,min(occurred_at)::date cohort_day from events where project_id=$1 group by 1) select cohort_day,count(*)::int users from firsts group by 1 order by 1",[id]);
 if(cmd==='retention'){
  const days=integer(o.days||7,1,90),through=date(o.through||today());
  return db.query("with firsts as(select distinct_id,min(occurred_at)::date cohort_day from events where project_id=$1 and occurred_at<$3::date+interval '1 day' group by 1), mature as(select * from firsts where cohort_day+$2::int<=$3::date), measured as(select f.*,exists(select 1 from events e where e.project_id=$1 and e.distinct_id=f.distinct_id and e.occurred_at>=f.cohort_day+$2::int and e.occurred_at<f.cohort_day+$2::int+interval '1 day') retained from mature f) select cohort_day,$2::int exact_day,$3::date measured_through,count(*)::int eligible_users,count(*) filter(where retained)::int retained_users,round(100.0*count(*) filter(where retained)/count(*),2) retention_percent from measured group by 1 order by 1",[id,days,through]);
 }
 if(cmd==='quiet-users'){
  const days=integer(o.days||7,1,3650),through=date(o.through||today());
  return db.query("select distinct_id,max(occurred_at)::date last_observed,$2::date-max(occurred_at)::date quiet_days from events where project_id=$1 and occurred_at<$2::date+interval '1 day' group by 1 having max(occurred_at)::date<$2::date-$3::int order by last_observed,distinct_id",[id,through,days]);
 }
 if(cmd==='quality')return db.query('select event_name,distinct_id,property,finding from event_quality where project_id=$1 order by event_name,distinct_id,property',[id]);
 if(cmd==='freshness')return db.query('select event_name,max(occurred_at)::date last_observed,current_date-max(occurred_at)::date days_since_event,count(*)::int imported_events from events where project_id=$1 group by 1 order by 1',[id]);
 if(cmd==='attention')return db.query('select reference,rule,finding,owner from review_attention where project_id=$1 order by rule,reference',[id]);
 if(cmd==='compliance')return [
  ...await db.query("select reference,rule,finding,owner from review_attention where project_id=$1 and rule in ('privacy_retention','tracking_contract','event_review') order by rule,reference",[id]),
  ...await db.query("select event_name reference,'tracking_accuracy' rule,count(*)::text||' missing required property occurrence(s)' finding,'' owner from event_quality where project_id=$1 group by 1 order by 1",[id])];
 if(cmd==='actions')return db.query('select code,title,owner,due_on,status,evidence from actions where project_id=$1 order by due_on,code',[id]);
 if(cmd==='activity')return db.query('select actor,operation,details,created_at from activity where project_id=$1 order by created_at,id',[id]);
 if(cmd==='funnels')return db.query('select code,name,steps,window_hours from funnels where project_id=$1 order by code',[id]);
 if(cmd==='funnel'){
  const f=await resolve(db,'funnels',required(o,'ref'),id),[from,to]=range(o);
  const rows=await db.query(`with recursive journey as (
   select distinct_id,1 step,min(occurred_at) first_at,min(occurred_at) reached_at from events
    where project_id=$1 and event_name=$2::jsonb->>0 and occurred_at>=$3::date and occurred_at<$4::date+interval '1 day' group by 1
   union all
   select j.distinct_id,j.step+1,j.first_at,e.occurred_at from journey j cross join lateral (
    select occurred_at from events where project_id=$1 and distinct_id=j.distinct_id and event_name=$2::jsonb->>j.step
     and occurred_at>j.reached_at and occurred_at<=j.first_at+$5::int*interval '1 hour' and occurred_at<$4::date+interval '1 day'
    order by occurred_at limit 1) e where j.step<jsonb_array_length($2::jsonb)
  ) select s.step,$2::jsonb->>(s.step-1) event_name,count(j.distinct_id)::int users
   from generate_series(1,jsonb_array_length($2::jsonb)) s(step) left join journey j on j.step=s.step group by s.step order by s.step`,[id,JSON.stringify(f.steps),from,to,f.window_hours]);
  const base=rows[0]?.users||0;return rows.map((r,i)=>({...r,from_entry_percent:base?Math.round(r.users/base*10000)/100:null,lost_since_previous:i?rows[i-1].users-r.users:0}));
 }
 if(cmd==='set-rule')return transaction(db,async()=>{
  const name=required(o,'event'),props=JSON.parse(o.required||'[]');if(!Array.isArray(props)||props.some(x=>typeof x!=='string'||!x.trim())||new Set(props).size!==props.length)throw Error('required must be an array of unique property names');
  const before=await db.query('select * from event_types where project_id=$1 and name=$2',[id,name]);
  const rows=await db.query('insert into event_types(project_id,name,owner,purpose,required_properties,review_on) values($1,$2,$3,$4,$5,$6) on conflict(project_id,name) do update set owner=excluded.owner,purpose=excluded.purpose,required_properties=excluded.required_properties,review_on=excluded.review_on returning name,owner,purpose,required_properties,review_on',[id,name,required(o,'owner'),required(o,'purpose'),JSON.stringify(props),date(required(o,'review-on'))]);
  await log(db,id,actor,cmd,{before,after:rows});return rows;
 });
 if(cmd==='define-funnel')return transaction(db,async()=>{
  const steps=JSON.parse(required(o,'steps'));if(!Array.isArray(steps)||steps.length<2||steps.length>5||steps.some(s=>typeof s!=='string'||!s.trim()))throw Error('steps needs 2..5 event names');
  for(const name of steps)if(!(await db.query('select id from event_types where project_id=$1 and name=$2',[id,name])).length)throw Error(`Unknown event: ${name}`);
  const rows=await db.query('insert into funnels(project_id,code,name,steps,window_hours) values($1,$2,$3,$4,$5) returning code,name,steps,window_hours',[id,required(o,'code'),required(o,'name'),JSON.stringify(steps),integer(required(o,'hours'),1,8760)]);await log(db,id,actor,cmd,rows);return rows;
 });
 if(cmd==='add-action')return transaction(db,async()=>{const rows=await db.query('insert into actions(project_id,code,title,owner,due_on) values($1,$2,$3,$4,$5) returning code,title,owner,due_on',[id,required(o,'code'),required(o,'title'),required(o,'owner'),date(required(o,'due-on'))]);await log(db,id,actor,cmd,rows);return rows;});
 if(cmd==='close-action')return transaction(db,async()=>{const a=await resolve(db,'actions',required(o,'ref'),id);if(a.status==='closed')throw Error('Action already closed');const rows=await db.query("update actions set status='closed',evidence=$2,closed_at=now() where id=$1 and status='open' returning code,status,evidence",[a.id,required(o,'evidence')]);if(!rows.length)throw Error('Action already closed');await log(db,id,actor,cmd,rows);return rows;});
 if(cmd==='log'){await log(db,id,actor,'note',{note:required(o,'note')});return [{recorded:true}];}
 if(cmd==='import'){
  if(args.length!==1||args[0]!=='mixpanel')throw Error('Usage: import mixpanel --file=<raw JSONL> --project=<code> --actor=<name>');
  const input=parseExport(required(o,'file'));
  return transaction(db,async()=>{
   // Serialise imports to the same project to prevent overlapping export races.
   await db.query('select id from projects where id=$1 for update',[id]);
   let inserted=0,existing=0;
   for(const e of input.records){
    const prior=await db.query('select source_record from events where project_id=$1 and source_key=$2',[id,e.key]);
    if(prior.length){if(canonical(prior[0].source_record)!==canonical(e.raw))throw Error('Conflicting imported event: existing history is unchanged');existing++;continue;}
    await db.query('insert into event_types(project_id,name) values($1,$2) on conflict do nothing',[id,e.event]);
    await db.query('insert into events(project_id,source_key,event_name,distinct_id,occurred_at,properties,source_record) values($1,$2,$3,$4,$5,$6,$7)',[id,e.key,e.event,e.person,e.at,JSON.stringify(e.properties),JSON.stringify(e.raw)]);inserted++;
   }
   await db.query('insert into imports(project_id,digest,row_count,inserted_count,actor) values($1,$2,$3,$4,$5) on conflict do nothing',[id,input.digest,input.rows,inserted,actor]);
   const result={rows:input.rows,inserted,existing,duplicates:input.duplicates,dry_run:Boolean(o['dry-run'])};await log(db,id,actor,'import',result);return [result];
  },Boolean(o['dry-run']));
 }
 if(cmd==='export'){
  const file=path.resolve(required(o,'file'));const out={format:'product-analytics-v1',exported_at:new Date().toISOString(),project:p};
  await db.exec('BEGIN READ ONLY');try{for(const t of tables.filter(t=>t!=='projects'))out[t]=await db.query(`select * from ${t} where project_id=$1 order by id`,[id]);}finally{await db.exec('ROLLBACK');}
  fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n',{flag:'wx',mode:0o600});return [{file,events:out.events.length}];
 }
 if(cmd==='weekly-review'||cmd==='draft-review'){
  const review={};for(const c of ['events','quality','attention','freshness'])review[c]=await run(db,c,{project:p.code});
  if(cmd==='weekly-review')return review;
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`review-${p.id}-${randomUUID()}.md`);
  fs.writeFileSync(file,`# Draft for human review\n\n${p.name}\n\nSnapshot of imported events. Check export completeness and measurement definitions before acting.\n\n${Object.entries(review).map(([k,v])=>'## '+k+'\n\n'+format(v)).join('\n\n')}\n`,{flag:'wx',mode:0o600});return [{file}];
 }
 throw Error(`Unimplemented command: ${cmd}`);
}
export function format(result){if(Array.isArray(result)){if(!result.length)return '  (none)';const rows=result.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v instanceof Date?v.toISOString():v&&typeof v==='object'?JSON.stringify(v):v])));return table(rows,Object.keys(rows[0]).map(key=>({key,label:key.replaceAll('_',' ')})));}return Object.entries(result).map(([k,v])=>k+'\n'+format(v)).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const [cmd='help',...rest]=process.argv.slice(2),o={},args=[];for(const a of rest){if(a.startsWith('--')){const i=a.indexOf('=');const key=a.slice(2,i<0?undefined:i);if(key in o)throw Error(`Duplicate --${key}`);o[key]=i<0?true:a.slice(i+1);}else args.push(a);}db=await getDb();const result=await run(db,cmd,o,args);console.log(o.json?JSON.stringify(result,null,2):format(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
