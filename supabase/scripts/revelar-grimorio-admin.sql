-- Libera as 22 cartas no grimório da conta de desenvolvimento.
update public.acessos
set cartas_vividas = '[
  {"id":0,"nome":"O Louco","em":"2026-08-24"},
  {"id":1,"nome":"O Mago","em":"2026-08-24"},
  {"id":2,"nome":"A Sacerdotisa","em":"2026-08-24"},
  {"id":3,"nome":"A Imperatriz","em":"2026-08-24"},
  {"id":4,"nome":"O Imperador","em":"2026-08-24"},
  {"id":5,"nome":"O Hierofante","em":"2026-08-24"},
  {"id":6,"nome":"Os Enamorados","em":"2026-08-24"},
  {"id":7,"nome":"O Carro","em":"2026-08-24"},
  {"id":8,"nome":"A Força","em":"2026-08-24"},
  {"id":9,"nome":"O Eremita","em":"2026-08-24"},
  {"id":10,"nome":"A Roda da Fortuna","em":"2026-08-24"},
  {"id":11,"nome":"A Justiça","em":"2026-08-24"},
  {"id":12,"nome":"O Enforcado","em":"2026-08-24"},
  {"id":13,"nome":"A Morte","em":"2026-08-24"},
  {"id":14,"nome":"A Temperança","em":"2026-08-24"},
  {"id":15,"nome":"O Diabo","em":"2026-08-24"},
  {"id":16,"nome":"A Torre","em":"2026-08-24"},
  {"id":17,"nome":"A Estrela","em":"2026-08-24"},
  {"id":18,"nome":"A Lua","em":"2026-08-24"},
  {"id":19,"nome":"O Sol","em":"2026-08-24"},
  {"id":20,"nome":"O Julgamento","em":"2026-08-24"},
  {"id":21,"nome":"O Mundo","em":"2026-08-24"}
]'::jsonb
where lower(email) in (
  'arcanodigital.com.br@gmail.com',
  'arcandigital.com.br@gmail.com'
);
