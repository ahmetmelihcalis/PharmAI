# **Takım İsmi**

AI Takım 38

# Ürün İle İlgili Bilgiler
## Takım Elemanları
- Ahmet Melih Çalış: Scrum Master & Developer
- Melike Atila: Product Owner
- Cansu Ceylan: Developer
- Kaan Bilirgen: Developer
- Buse Nur Ermez: Developer

## Ürün İsmi

-- PharmAI --

## Ürün Videosu URL
[AI Team 38 Video URL](https://youtu.be/rz_fvUvts4s?feature=shared)

## Proje Çalışma ve Backlog Sayfası URL
[AI Team 38 Notion URL](https://www.notion.so/YZTA-BOOTCAMP-219b335bd7e2802c97ffdd41cc733621?source=copy_link)

## Ürün Açıklaması
PharmAI, ilaçlar hakkındaki genel bilgileri, yan etkileri ve etkileşimleri sunan, yapay zeka destekli bir ilaç bilgi platformudur.

## Ürün Özellikleri
- İlaç bilgilerini özetleyen yapay zeka motoru
- İlaç etkileşim mekanizması
- İlaç karşılaştırma sistemi
- Üyelik sistemi ve kişiselleştirme

## Hedef Kitle

- İlaç kullanıcıları
- Eczacılar
- Doktorlar
- Eczacılık / Tıp Öğrencileri
- Eczaneler
- Hastaneler

---
# Projeyi Lokal Ortamda Çalıştırma (Kurulum Rehberi)

Bu rehber, PharmAI projesini kendi bilgisayarınızda sıfırdan kurup çalıştırmanız için gerekli adımları içermektedir. Proje, bir Backend ve bir Frontend olmak üzere iki ana parçadan oluşur.

## Gereksinimler
- Python (versiyon 3.8 veya üstü)
- Node.js ve npm
- Git

## Adım 1: Projeyi Bilgisayarınıza İndirme (Klonlama)

Bu adımla, projenin tüm dosyalarını internetten (GitHub'dan) kendi bilgisayarınıza indireceksiniz.

Bu komutların çalışması için bilgisayarınızda Git'in kurulu olması gerekmektedir.

1. Bilgisayarınızda projenin kurulmasını istediğiniz bir klasörde (örneğin Masaüstü veya Belgeler) bir terminal (Komut İstemi, PowerShell, vb.) açın.

2. Aşağıdaki komutu kopyalayıp terminale yapıştırın ve Enter'a basın. Bu komut, projenin tüm dosyalarını internetten indirip PharmAI adında yeni bir klasör oluşturacaktır.

       git clone https://github.com/ahmetmelihcalis/PharmAI.git

3. İndirme işlemi bittikten sonra, oluşturulan bu yeni klasörün içine girmek için aşağıdaki komutu çalıştırın:

       cd PharmAI

## Adım 2: Backend'i Ayarlama ve Çalıştırma

1. Öncelikle yeni bir Powershell terminali açın ve dosyanın bilgisayarınızdaki konumuna gidin.

2. Daha sonra aşağıdaki komutla dosya içindeki backend klasörüne gidin.

       cd backend

3. Bilgisayarınıza aşağıdaki komutla sanal ortamı kurun

       python -m venv venv

4. Ardından sanal ortamı aktive edin.

## Windows için:

    .\venv\Scripts\activate

## macOS / Linux için:

    source venv/bin/activate

5. API anahtarını ayarlayın.

Backend klasörü içindeki .env dosyasına gidin ve aşağıdaki satırı bulun:

    GOOGLE_API_KEY = 

Dosyanın içindeki satıra Google AI Studio'dan oluşturduğunuz kendi Google Gemini API anahtarınızı yapıştırın:

    GOOGLE_API_KEY= "SIZIN_GOOGLE_GEMINI_API_ANAHTARINIZ"

6. Sanal ortamı aktive ettikten ve API anahtarını ayarladıktan sonra gerekli dosyaları indirin.

       pip install -r requirements.txt

7. Artık aşağıdaki komutla backendi çalıştırabilirsiniz.

       uvicorn app.main:app --reload

### Terminalde Uvicorn running on http://127.0.0.1:8000 mesajını gördüğünüzde, backend başarıyla çalışıyor demektir. Bu terminali açık bırakın.

## Adım 3: Frontend'i Ayarlama ve Çalıştırma (Kullanıcı Arayüzü)

1. YENİ BİR Powershell terminali açın (***backend ile aynı terminalde çalışmaz***) ve projenin ana klasöründen frontend klasörüne gidin.

       cd frontend

2. Gerekli paketleri kurun.

       npm install

3. Frontend uygulamasını başlatın.

       npm start

### Bu komut, tarayıcınızda otomatik olarak http://localhost:3000 adresini açacaktır. Artık PharmAI uygulamasını kullanabilirsiniz.

---

# Sprint 1

- **Sprint Notları**: Bu sprint kapsamında ağırlıklı olarak fikir geliştirme ve proje yönetimi süreçlerine odaklanılmıştır. Takım, proje fikrinin olgunlaştırılması ve iş planlamalarının yapılması üzerine çalışmalar gerçekleştirmiştir. Ürün geliştirme süreci ise sonraki sprintlerde öncelikli olarak ele alınacaktır. Ayrıca, bu sprintte hazırlanan taslak demo çalışmasına ait bir ekran görüntüsü kesiti, Project Management klasörünün Sprint 1 alt klasöründe belgelenmiştir.

- **Sprint içinde tamamlanması tahmin edilen puan**: 80 Puan

- **Puan tamamlama mantığı**: Toplamda proje boyunca tamamlanması gereken 300 puanlık backlog bulunmaktadır. 3 sprint'e bölündüğünde ilk sprint'in en azından 80 ile başlaması gerektiğine karar verildi.

- **Daily Scrum**: Daily Scrum toplantılarının müsaitlik durumuna göre Google Meet veya WhatsApp üzerinden yapılmasına karar verildi. Daily Scrum toplantısı örnekleri ürün Github reposunda Project Management dosyası içindeki Sprint1 klasöründe Whatsapp Daily Scrum Ekran Görüntüleri dosyaları altında tarafımızdan paylaşılmaktadır.

- **Sprint Board Update**:

Sprint Board Screenshot: 

![Backlog 1](https://github.com/ahmetmelihcalis/PharmAI/blob/bb3c7f41406cf03115a5d94d7ed426476f9dc845/Project%20Management/Sprint1/Sprint%201%20-%20Sprint%20Board%20-%20Notion.png?raw=true)

- **Sprint Review:**

- Ürünün konsepti ve adı belirlendi.

- Ürünün sahip olması gereken temel özellikler tanımlandı.

- Yol haritasını daha sağlıklı planlayabilmek amacıyla taslak bir demo hazırlandı ve bu süreçte ürünün eksik yönleri tespit edildi.

- Sprint Review Katılımcıları:

  Ahmet Melih Çalış

  Melike Atila

  Kaan Bilirgen

  Cansu Ceylan

  Buse Nur Ermez

- **Sprint Retrospective:**

- Ürün özelliklerinin daha ayrıntılı şekilde ele alınması gerektiği tespit edildi ve bu doğrultuda ilerleyen sprintlerde detaylandırma yapılmasına karar verildi.

- Ürün geliştirme sürecinde daha fazla ilerleme kaydedebilmek için ekip içi iş bölümü ve hız konusunda iyileştirme kararı alındı.

- Ürün geliştirme aşamasında kullanılan teknolojilerin gözden geçirilmesi sonucunda, belirli teknolojilerde değişiklik yapılması gerektiği değerlendirilerek bu konuda adım atılması kararlaştırıldı.
 
---

# Sprint 2

- **Sprint Notları**: Bu sprint kapsamında ağırlıklı olarak ürün geliştirme sürecine odaklanılmıştır. Takım, ürün üzerinde birçok geliştirme tamamladı.

- **Sprint içinde tamamlanması tahmin edilen puan**: 120 Puan

- **Puan tamamlama mantığı**: Proje boyunca tamamlanması gereken toplam 300 puanlık backlog bulunmaktadır. 3 sprinte bölündüğünde ikinci sprintin 120 puandan oluşması gerektiği kararlaştırıldı.

- **Daily Scrum**: Daily Scrum toplantıları müsaitlik durumuna göre Google Meet veya WhatsApp üzerinden yapılmaya devam edildi.

- **Sprint Board Update**:

Sprint Board ve Product Screenshots: 

![Backlog 2](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint2/Sprint%202%20-%20Sprint%20Board%20-%20Notion.png?raw=true)

![Backlog 3](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint2/%C3%9Cr%C3%BCn%20Foto%201.png?raw=true)

![Backlog 4](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint2/%C3%9Cr%C3%BCn%20Foto%202.png?raw=true)

![Backlog 5](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint2/%C3%9Cr%C3%BCn%20Foto%203.png?raw=true)


- **Sprint Review:**

- Ürünün ana iskeleti tamamlandı.

- Ürünün sahip olması gereken temel özellikler tamamlandı.

- Frontend tasarımı oluşturuldu.

- Sprint Review Katılımcıları:

  Ahmet Melih Çalış

  Melike Atila

  Cansu Ceylan

  Kaan Bilirgen

- **Sprint Retrospective:**

- Yapay zeka motorundaki eksikler tespit edildi, iyileştirme süreci için bir yol haritası belirlendi ve yapay zeka motoru geliştirme çalışmalarına devam edilmesi kararı verildi.

- Ürün detaylarındaki eksiklerin giderilmesi ve veri setiyle ilgili sorunların çözülmesi hedeflendi.

- Profil sayfası ile kayıt/giriş entegrasyonu üzerine çalışmaların sürdürülmesi planlandı

---

# Sprint 3

- **Sprint Notları**: Bu sprint kapsamında ürün geliştirme sürecinin tamamlanmasına odaklanılmıştır.

- **Sprint içinde tamamlanması tahmin edilen puan**: 100 Puan

- **Puan tamamlama mantığı**: Proje boyunca tamamlanması gereken toplam 300 puanlık backlog bulunmaktadır. 3 sprinte bölündüğünde üçüncü sprintin 100 puandan oluşması gerektiği kararlaştırıldı.

- **Daily Scrum**: Daily Scrum toplantıları müsaitlik durumuna göre Google Meet veya WhatsApp üzerinden yapılmaya devam edildi.

- **Sprint Board Update**:

Sprint Board ve Product Screenshots: 

![Backlog 1](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/Sprint%203%20-%20Sprint%20Board%20-%20Notion.png?raw=true)

![Backlog 2](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/1.png?raw=true)

![Backlog 3](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/2.png?raw=true)

![Backlog 4](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/3.png?raw=true)

![Backlog 5](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/4.png?raw=true)

![Backlog 6](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/5.png?raw=true)

![Backlog 7](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/6.png?raw=true)

![Backlog 8](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/7.png?raw=true)

![Backlog 9](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/8.png?raw=true)

![Backlog 10](https://github.com/ahmetmelihcalis/PharmAI/blob/main/Project%20Management/Sprint3/9.png?raw=true)


- **Sprint Review:**

- Ürünün yapay zeka motoru eksikleri geliştirildi.

- Ürünün tasarım eksikleri tamamlandı.

- Ürünün profil kısmında eklenmesi planlanıp eklenemeyen özellikler ve karşılaştırma kısmında ortaya çıkan çeviri hataları değerlendirildi.

- Sprint Review Katılımcıları:

  Ahmet Melih Çalış

- **Sprint Retrospective:**

- Takım üyelerinin gelecek projelerde daha fazla aktif olması gerektiği vurgulanmıştır.