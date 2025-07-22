import React from 'react';
import { Link } from 'react-router-dom';
import './DisclaimerPage.css';

const DisclaimerPage = () => {
    return (
        <div className="page-container">
            <div className="disclaimer-content">
                <h1 className="page-title">Yasal Uyarı ve Bilgilendirme</h1>
                
                <p>
                    Bu uygulamada sunulan içerikler, UCI ML Drug Review veri seti kullanılarak oluşturulmuştur. 
                    Veri seti; ilaçlara ilişkin kullanıcı yorumlarını, değerlendirme puanlarını, kullanım amaçlarını 
                    ve diğer ilgili bilgileri içermekte olup, gerçek kullanıcı deneyimlerine dayanmaktadır. 
                    Tüm veriler anonimleştirilmiş ve yalnızca bilimsel araştırma ve eğitim amaçlı kullanım 
                    için kamuya açık hale getirilmiştir.
                </p>
                
                <h2>Önemli Bilgilendirme</h2>
                <p>
                    Uygulamada yer alan bilgiler, <strong>tıbbi tavsiye niteliği taşımaz</strong> ve herhangi bir ilacın 
                    güvenliği, etkinliği veya bireysel uygunluğu hakkında kesin bilgi sunmaz. 
                    Bu bilgiler, yalnızca genel bilgilendirme amacıyla sağlanmaktadır.
                </p>
                <p>
                    Her bireyin sağlık durumu farklıdır. Bu nedenle herhangi bir ilacı kullanmadan, 
                    değiştirmeden veya bırakmadan önce <strong>mutlaka yetkili bir sağlık profesyoneline (doktor, eczacı) danışılmalıdır.</strong>
                </p>
                <p className="final-warning">
                    Bu uygulama, hiçbir koşulda tıbbi tanı, tedavi ya da reçete yerine geçmez.
                </p>

                <Link to="/" className="home-button">Ana Sayfaya Dön</Link>
            </div>
        </div>
    );
};

export default DisclaimerPage;