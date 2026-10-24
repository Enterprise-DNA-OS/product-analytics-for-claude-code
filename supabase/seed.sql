
insert into projects(code,name,owner,purpose,review_on) values
 ('KAURI','Kauri learning demo','Mara','Understand lesson activation in a fictional product',current_date-3),
 ('KAURI-LAB','Kauri laboratory demo','Tane','Test tracking changes with fictional events',current_date+60)
 on conflict do nothing;
insert into event_types(project_id,name,owner,purpose,required_properties,review_on)
select p.id,v.name,v.owner,v.purpose,v.props::jsonb,current_date+v.days from projects p cross join (values
 ('Signed up','Mara','Measure entry','[]',30),('Lesson started','Mara','Measure activation','["lesson_id"]',30),
 ('Lesson completed','Mara','Measure completion','["lesson_id"]',-2),('Export clicked','','','[]',-2)) v(name,owner,purpose,props,days)
where p.code='KAURI' on conflict do nothing;
insert into events(project_id,source_key,event_name,distinct_id,occurred_at,properties,source_record)
select p.id,'demo-'||v.key,v.event,v.person,((current_date+v.days)::timestamp at time zone 'UTC')+v.hours*interval '1 hour',v.props::jsonb,
 jsonb_build_object('event',v.event,'properties',v.props::jsonb||jsonb_build_object('distinct_id',v.person,'time',extract(epoch from ((current_date+v.days)::timestamp at time zone 'UTC')+v.hours*interval '1 hour')::bigint,'$insert_id','demo-'||v.key))
from projects p cross join (values
 ('1','Signed up','person-01',-16,8,'{}'),('2','Lesson started','person-01',-16,9,'{"lesson_id":"lesson-a"}'),
 ('3','Lesson completed','person-01',-16,10,'{"lesson_id":"lesson-a"}'),('4','Lesson started','person-01',-9,9,'{"lesson_id":"lesson-b"}'),
 ('5','Signed up','person-02',-16,8,'{}'),('6','Lesson started','person-02',-15,9,'{"lesson_id":"lesson-a"}'),
 ('7','Signed up','person-03',-10,8,'{}'),('8','Lesson started','person-03',-10,9,'{}'),
 ('9','Export clicked','person-03',-3,10,'{}'),('10','Signed up','person-04',-2,8,'{}'),
 ('11','Lesson completed','person-04',-2,7,'{"lesson_id":"lesson-a"}'),('12','Export clicked','person-04',-1,8,'{}')
) v(key,event,person,days,hours,props) where p.code='KAURI' on conflict do nothing;
insert into funnels(project_id,code,name,steps,window_hours) select id,'ACTIVATION','Lesson activation','["Signed up","Lesson started","Lesson completed"]',48 from projects where code='KAURI' on conflict do nothing;
insert into actions(project_id,code,title,owner,due_on) select id,'TRACK-01','Check missing lesson identifier','Tane',current_date-2 from projects where code='KAURI' on conflict do nothing;
