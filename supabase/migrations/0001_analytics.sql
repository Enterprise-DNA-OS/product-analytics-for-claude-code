
create table projects (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 owner text not null, purpose text not null, review_on date not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table event_types (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), name text not null,
 owner text not null default '', purpose text not null default '', required_properties jsonb not null default '[]', review_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,name),
 check(jsonb_typeof(required_properties)='array')
);
create table events (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), source_key text not null,
 event_name text not null, distinct_id text not null, occurred_at timestamptz not null,
 properties jsonb not null, source_record jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,source_key),
 foreign key(project_id,event_name) references event_types(project_id,name), check(jsonb_typeof(properties)='object')
);
create index events_person_time on events(project_id,distinct_id,occurred_at);
create index events_name_time on events(project_id,event_name,occurred_at);
create table funnels (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), code text not null,
 name text not null, steps jsonb not null, window_hours integer not null check(window_hours between 1 and 8760),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,code),
 check(jsonb_typeof(steps)='array' and jsonb_array_length(steps) between 2 and 5)
);
create table actions (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), code text not null,
 title text not null, owner text not null, due_on date not null, status text not null default 'open' check(status in ('open','closed')),
 evidence text, closed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,code),
 check(status='open' or (length(trim(evidence))>0 and closed_at is not null))
);
create table imports (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), digest text not null,
 row_count integer not null, inserted_count integer not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,digest)
);
create table activity (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), actor text not null,
 operation text not null, details jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['projects','event_types','events','funnels','actions','imports','activity'] loop
 execute format('create trigger touch_updated before update on %I for each row execute function touch_updated()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
end loop; end $$;
create view daily_usage as
 select project_id, (occurred_at at time zone 'UTC')::date as day,event_name,count(*)::int events,count(distinct distinct_id)::int users
 from events group by 1,2,3;
create view event_quality as
 select e.project_id,e.id,e.event_name,e.distinct_id,k.value property,'missing_required_property' finding
 from events e join event_types t on t.project_id=e.project_id and t.name=e.event_name
 cross join lateral jsonb_array_elements_text(t.required_properties) k
 where not(e.properties ? k.value) or e.properties->k.value='null'::jsonb or e.properties->>k.value='';
create view review_attention as
 select project_id,code as reference,'overdue_action' rule,title finding,owner from actions where status='open' and due_on<current_date
 union all select project_id,name,'tracking_contract','Event has no owner or purpose',owner from event_types where owner='' or purpose=''
 union all select project_id,name,'event_review','Event purpose and property review due',owner from event_types where review_on is null or review_on<current_date
 union all select id,code,'privacy_retention','Review whether event history is still needed',owner from projects where review_on<current_date;
revoke all on daily_usage,event_quality,review_attention from public;
