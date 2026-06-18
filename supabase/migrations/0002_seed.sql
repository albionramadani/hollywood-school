-- =====================================================================
-- Hollywood School — seed data (migrated from src/data/programs.ts)
-- Run after 0001_init.sql. Idempotent via upserts.
-- Image fields store an asset key resolved by the frontend
-- (class-kids | class-teens | class-adults | hero-stage).
-- =====================================================================

-- ---------- categories ----------
insert into public.categories (id, title, age, description, about, highlights, image, sort) values
('kids','Kids','Ages 6 – 12',
 'Playful, confidence-building foundations — imagination, voice, and first steps on stage.',
 'Our Kids program is a joyful first step on stage. Through games, storytelling, and playful exercises, young performers build confidence, focus, and a love of performing — at their own pace, in a warm and supportive environment.',
 array['Confidence and stage presence','Voice, diction, and clear speech','Imagination and creative play','A term-end performance for family'],
 'class-kids', 0),
('teens','Teens','Ages 13 – 17',
 'Screen acting, improv, and theatre performance that turn instinct into real technique.',
 'The Teens program turns raw instinct into real technique. Students train across screen acting, improvisation, and theatre — building the craft and confidence to perform, and to audition, with genuine presence.',
 array['On-camera and scene-study technique','Improv and ensemble work','Audition and self-tape skills','Live theatre performance experience'],
 'class-teens', 1),
('young-adults','Young Adults','Ages 18 – 24',
 'Build a craft and a career — conservatory-level training for the working actor.',
 'Conservatory-level training for the committed young actor. Build a craft, a reel, and a career through rigorous scene study, on-camera work, and real industry preparation.',
 array['Conservatory-level craft and technique','A professional demo reel','Advanced scene study','Career and industry preparation'],
 'class-adults', 2),
('professional','Professional Track','Advanced',
 'Intensive masterclasses for working and professional actors sharpening their edge.',
 'Intensive masterclasses for working and professional actors. Sharpen your edge with advanced coaching in audition technique, on-set craft, and sustaining truthful performance under real conditions.',
 array['Masterclass-level coaching','Audition and self-tape mastery','On-set film technique','Sustaining truth across long shoots'],
 'hero-stage', 3)
on conflict (id) do update set
  title=excluded.title, age=excluded.age, description=excluded.description,
  about=excluded.about, highlights=excluded.highlights, image=excluded.image, sort=excluded.sort;

-- ---------- courses ----------
insert into public.courses (id, category_id, title, level, duration, schedule, description, instructor, price, seats, cap, sort) values
('teens-scene','teens','On-Camera Scene Study','Intermediate','12 weeks','Tue · 5–7pm','Build a screen-ready scene from cold read to final take, with weekly playback.','Dahlia Voss',1450,6,14,0),
('teens-screen','teens','Screen Acting','Beginner','10 weeks','Thu · 5–7pm','The fundamentals of truthful, camera-aware performance for the new screen actor.','Leo Fontaine',1180,9,14,1),
('teens-improv','teens','Improvisation','All levels','8 weeks','Mon · 6–8pm','Think fast, fail joyfully, and unlock the spontaneity directors love.','Nadia Cruz',940,11,16,2),
('teens-theatre','teens','Theatre Performance','Intermediate','12 weeks','Sat · 2–5pm','A full stage production — text, blocking, and a live performance for an audience.','Marcus Bell',1320,4,18,3),
('ya-foundations','young-adults','Conservatory Foundations','Beginner','14 weeks','Mon/Wed · 6–9pm','A rigorous grounding in technique, text, and presence for the serious beginner.','Eleanor Frost',2200,7,16,0),
('ya-scenelab','young-adults','Advanced Scene Study Lab','Advanced','12 weeks','Tue · 6:30–9:30pm','Demanding partner work on contemporary film scenes, critiqued frame by frame.','Eleanor Frost',1980,2,12,1),
('ya-reel','young-adults','Reel Production Intensive','Intermediate','6 weeks','Sat · 10am–2pm','Write, shoot, and edit two professional scenes — leave with a finished demo reel.','Leo Fontaine',1750,5,10,2),
('ya-voice','young-adults','Voice for Camera','All levels','8 weeks','Thu · 6–8pm','Microphone technique, accent work, and ADR for the working voice actor.','Marcus Bell',1280,8,14,3),
('pro-advanced','professional','Advanced Screen Acting','Professional','10 weeks','Wed · 7–10pm','For represented actors — sustaining truth across coverage, takes, and long days.','Eleanor Frost',2650,3,10,0),
('pro-audition','professional','Audition Mastery','Professional','6 weeks','Mon · 7–9:30pm','Self-tape strategy, room craft, and choices that book the job.','Dahlia Voss',1850,4,12,1),
('pro-film','professional','Film Acting Intensive','Professional','4 weeks','Sat/Sun · 10am–4pm','A masterclass on a real set with a working director.','Leo Fontaine',3200,1,8,2)
on conflict (id) do update set
  category_id=excluded.category_id, title=excluded.title, level=excluded.level, duration=excluded.duration,
  schedule=excluded.schedule, description=excluded.description, instructor=excluded.instructor,
  price=excluded.price, seats=excluded.seats, cap=excluded.cap, sort=excluded.sort;

-- ---------- summer programs ----------
insert into public.summer_programs (id, title, audience, duration, start, status, highlight, price, sort) values
('screen-intensive','Screen Intensive','Teens','4 weeks','Jul 6','12 Seats',true,2950,0),
('young-stars','Young Stars Camp','Kids','2 weeks','Jun 22','Filling Fast',true,1450,1),
('conservatory-lab','Conservatory Lab','Young Adults','4 weeks','Jul 6','Waitlist',false,3400,2),
('audition-bootcamp','Audition Bootcamp','All ages','1 week','Aug 3','Open',true,1100,3)
on conflict (id) do update set
  title=excluded.title, audience=excluded.audience, duration=excluded.duration, start=excluded.start,
  status=excluded.status, highlight=excluded.highlight, price=excluded.price, sort=excluded.sort;

-- ---------- testimonials ----------
insert into public.testimonials (id, name, initials, role, quote, rating, category, featured, sort) values
('maya-r','Maya R.','MR','Parent · Teens Program','My daughter walked in shy and walked out booking her first national commercial. Hollywood School changed her life.',5,'parent',true,0),
('daniel-o','Daniel O.','DO','Alum · Now represented','The conservatory year rebuilt my craft from the ground up. Within months of graduating I signed with an agent and booked a series regular.',5,'success',true,1),
('priya-s','Priya S.','PS','Young Adult Student','I came for a reel and left with a technique I trust under any pressure. The on-camera playback every week changed everything.',5,'student',true,2),
('carla-m','Carla M.','CM','Parent','The most professional youth program we found. My son''s confidence is unrecognizable.',5,'parent',false,3),
('theo-b','Theo B.','TB','Teen Student','Improv class made me brave. I auditioned for my school play and got the lead.',5,'student',false,4),
('jasmine-w','Jasmine W.','JW','Alum · Booked a series','Audition Mastery taught me how to walk into the room and own it. It books jobs.',5,'success',false,5),
('greg-p','Greg P.','GP','Parent','Small classes, real directors, zero ego. Worth every cent.',5,'parent',false,6),
('lina-k','Lina K.','LK','Young Adult','The reel I built here got me my first three auditions. The faculty genuinely care.',4,'student',false,7),
('marcus-d','Marcus D.','MD','Alum · Stage debut','From hobbyist to working actor in eighteen months. The conservatory is the real deal.',5,'success',false,8)
on conflict (id) do update set
  name=excluded.name, initials=excluded.initials, role=excluded.role, quote=excluded.quote,
  rating=excluded.rating, category=excluded.category, featured=excluded.featured, sort=excluded.sort;

-- ---------- media items ----------
insert into public.media_items (id, title, category, video, image, sort) values
('m1','Spring Showcase — Final Scene','performances',true,'hero-stage',0),
('m2','On the studio floor','photos',false,'class-kids',1),
('m3','Lighting the set','bts',false,'hero-stage',2),
('m4','Monologue night','performances',true,'class-teens',3),
('m5','Scene study in session','photos',false,'class-adults',4),
('m6','Rehearsal, take twelve','bts',false,'class-teens',5),
('m7','Self-tape masterclass','videos',true,'hero-stage',6),
('m8','Curtain call','photos',false,'class-kids',7),
('m9','On-camera intensive reel','videos',true,'class-adults',8),
('m10','Teen ensemble, Act II','performances',false,'class-teens',9),
('m11','Director''s notes','bts',false,'class-adults',10),
('m12','Conservatory cohort','photos',false,'hero-stage',11)
on conflict (id) do update set
  title=excluded.title, category=excluded.category, video=excluded.video, image=excluded.image, sort=excluded.sort;

-- ---------- settings ----------
insert into public.settings (key, value) values
('academy_name','Hollywood School'),
('contact_email','info@hollywoodschool.com'),
('phone','+383 48 734 899'),
('currency','USD ($)')
on conflict (key) do update set value=excluded.value;
