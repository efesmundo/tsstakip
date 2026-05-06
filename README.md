# Tedeta Servis Takip

Next.js, TypeScript, Tailwind CSS ve Supabase ile geliştirilen servis kayıt yönetim uygulaması.

## Roller

- `admin`: Üyeleri yönetir, üye ekler/siler, tüm servis kayıtlarını görüntüler ve düzenler.
- `member`: Sadece kendi adına servis kaydı açar ve kendi kayıtlarını görüntüler.

## Kurulum

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır.

## Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayıp değerleri doldurun.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY` sadece server-side admin işlemlerinde kullanılır. Vercel deploy sırasında bu üç değişkeni Project Settings > Environment Variables alanına ekleyin.

## Supabase

SQL migration dosyaları `supabase/migrations` altında tutulur. Yeni kurulumda dosyaları sıra ile çalıştırın:

```text
001_initial_schema.sql
002_add_member_role.sql
003_member_access_model.sql
```

Eğer daha önce eski teknisyen modeli çalıştırıldıysa, `002` ve `003` migration dosyaları rol modelini `admin/member` yapısına taşır.

`001_initial_schema.sql` çalışırken `column "member_id" does not exist` hatası alınırsa önce şu repair dosyasını çalıştırın, sonra `001_initial_schema.sql` dosyasını tekrar çalıştırın:

```text
supabase/repairs/repair_001_member_id_missing.sql
```
