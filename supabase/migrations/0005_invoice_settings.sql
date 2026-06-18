-- Invoice / bank-transfer settings (editable from Admin → Settings).
-- `do nothing` keeps any values you've already edited.
insert into public.settings (key, value) values
  ('academy_name',    'Hollywood School'),
  ('academy_email',   'info@hollywoodschool.com'),
  ('academy_phone',   '+383 48 734 899'),
  ('academy_address', 'Prishtinë, Rr. Gjilani nr.204'),
  ('currency_symbol', '$'),
  ('bank_holder',     'Hollywood School'),
  ('bank_name',       'Your Bank'),
  ('bank_iban',       'XK00 0000 0000 0000 0000'),
  ('bank_swift',      ''),
  ('invoice_note',    'Please pay by bank transfer within 7 days, using the invoice number as the payment reference. Your seat is confirmed once the transfer is received.')
on conflict (key) do nothing;
