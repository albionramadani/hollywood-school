-- Sample Kids courses (so every category has courses for CRUD/testing).
insert into public.courses (id, category_id, title, level, duration, schedule, description, instructor, price, seats, cap, sort) values
('kids-acting-basics','kids','Acting Basics','Beginner','8 weeks','Sat · 10–11:30am','A joyful first step on stage — games, storytelling, and the confidence to be seen.','Priya Anand',680,5,12,0),
('kids-voice','kids','Voice & Diction','Beginner','8 weeks','Wed · 4–5:30pm','Breath, projection, and clarity — the voice as a young actor''s first instrument.','Marcus Bell',720,8,12,1),
('kids-camera','kids','Camera Acting for Kids','Intermediate','10 weeks','Sat · 1–3pm','First time on camera — hitting marks, finding the lens, and watching playback.','Dahlia Voss',980,6,10,2)
on conflict (id) do update set
  category_id=excluded.category_id, title=excluded.title, level=excluded.level, duration=excluded.duration,
  schedule=excluded.schedule, description=excluded.description, instructor=excluded.instructor,
  price=excluded.price, seats=excluded.seats, cap=excluded.cap, sort=excluded.sort;
