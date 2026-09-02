/**
 * gen-lang-pages.js —— 生成多语言 SEO 静态内容页（tr/ko/ja）
 *
 * 用法：node scripts/gen-lang-pages.js
 * 产出：frontend/{tr,ko,ja}/{guide,faq,what-is-rent}.html（共 9 个）
 * 说明：中英页面为历史手写版，不在此生成；本脚本只生成新增语言，hreflang 指向全部 5 门。
 */
const fs = require("fs");
const path = require("path");

const FRONT = path.join(__dirname, "..", "frontend");
const BASE = "https://solata.top";

const LANG_META = {
  zh: { code: "zh-CN", dir: "", label: "中文", htmlLang: "zh-CN" },
  en: { code: "en", dir: "en", label: "EN", htmlLang: "en" },
  tr: { code: "tr", dir: "tr", label: "Türkçe", htmlLang: "tr" },
  ko: { code: "ko", dir: "ko", label: "한국어", htmlLang: "ko" },
  ja: { code: "ja", dir: "ja", label: "日本語", htmlLang: "ja" },
};

function url(page, langId) {
  const m = LANG_META[langId];
  return `${BASE}/${m.dir ? m.dir + "/" : ""}${page}.html`;
}

function hreflang(page, langId) {
  const links = Object.keys(LANG_META)
    .map((id) => `<link rel="alternate" hreflang="${LANG_META[id].code}" href="${url(page, id)}">`)
    .join("\n");
  return `${links}\n<link rel="alternate" hreflang="x-default" href="${url(page, "zh")}">`;
}

// 语言切换导航（当前语言高亮）
function langNav(page, langId) {
  return Object.keys(LANG_META)
    .map((id) => `<a href="/${LANG_META[id].dir ? LANG_META[id].dir + "/" : ""}${page}.html"${id === langId ? ' class="active"' : ""}>${LANG_META[id].label}</a>`)
    .join("\n");
}

const CHROME = {
  tr: {
    nav: { home: "🏠 Ana Araç", guide: "📖 Rehber", faq: "❓ SSS", rent: "💡 Kira nedir" },
    copyright: "© 2026 solata.top · Sadece %10 komisyon · açık kaynak",
  },
  ko: {
    nav: { home: "🏠 홈 도구", guide: "📖 튜토리얼", faq: "❓ FAQ", rent: "💡 렌트란?" },
    copyright: "© 2026 solata.top · 수수료 10%만 · 오픈소스",
  },
  ja: {
    nav: { home: "🏠 ホームツール", guide: "📖 チュートリアル", faq: "❓ FAQ", rent: "💡 レントとは" },
    copyright: "© 2026 solata.top · 手数料は 10% のみ · オープンソース",
  },
};

// 每个语言 × 每页的 meta + body
const PAGES = {
  guide: {
    tr: {
      title: "Solana Kira Geri Alma Rehberi: 3 Adımda Kilitli SOL'unu Geri Al | solata.top",
      desc: "Solana kira geri alma tam rehberi: önce adres sorgusuyla sıfırlanmış/0 bakiyeli/honeypot hesap detaylarını gör, sonra cüzdanı bağla ve zombi hesapları tek tıkla kapatıp ATA kirasını geri al. Pump.fun işlem hacmi depozitosunu da geri al. 0 bakiyeli, sıfırlanmış ve honeypot hesapların hepsi geri alınabilir.",
      keywords: "solana kira geri alma rehberi, close token account, SOL kirasını geri al, ATA kirası, solana cüzdan temizliği, sıfırlanmış coin kirası, honeypot kirası, pump.fun işlem hacmi depozitosu, akümülatör depozitosu",
      ogTitle: "Solana Kira Geri Alma Rehberi: 3 Adımda Kilitli SOL'unu Geri Al | solata.top",
      ogDesc: "0 bakiyeli, sıfırlanmış ve honeypot hesapların hepsi geri alınabilir. Önce adres sorgula, sonra tek tıkla zombi hesapları kapatıp kirayı geri al.",
      jsonLd: {
        headline: "Solana Kira Geri Alma Rehberi: 3 Adımda Kilitli SOL'unu Geri Al",
        description: "Önce adres sorgusuyla sıfırlanmış/0 bakiyeli/honeypot hesap detaylarını gör, sonra cüzdanı bağla ve zombi hesapları tek tıkla kapatıp ATA kirasını geri al.",
        inLanguage: "tr",
      },
      body: `
    <div class="breadcrumb"><a href="/">Ana Sayfa</a><span>/</span>Rehber</div>
    <h1>Solana Kira Geri Alma Rehberi: 3 Adımda Kilitli SOL'unu Geri Al</h1>
    <p class="lead">Solana'da her sıfırlanmış, çöp, honeypot ve airdrop coin'e girdiğinde, cüzdanın otomatik olarak bir token hesabı açar ve yaklaşık 0.002 SOL kirayı kilitler. Bu rehber, hepsini adım adım nasıl geri alacağını gösterir.</p>

    <div class="callout info">
      <div class="callout-title">💡 Tek cümlelik prensip</div>
      Solana zinciri şunu şart koşar: her token hesabı (ATA) bir "kira" yatırmak zorundadır. Hesap kapatılabilirse kira geri döner; kapatılamazsa (coin satılamaz, hesapta bakiye varsa) bu SOL zincirde sıkışır. Biz bu zombi hesapları kapatmanı sağlarız.
    </div>

    <h2>Birinci Adım: Adres Sorgula —— önce ne kadar kilitli olduğunu, hangi hesapların olduğunu gör</h2>
    <p>Cüzdan bağlamana gerek yok; önce ana sayfadaki <b>「🔍 Adres Sorgula」</b> bölümüne herhangi bir cüzdan adresi (kendininki veya arkadaşınınki) gir, sistem otomatik tarar ve tüm token hesaplarının <b>detayını</b> listeler:</p>
    <ul>
      <li><b>0 bakiyeli hesap</b>: içinde token yok, doğrudan kapatılıp kira geri alınabilir</li>
      <li><b>Sıfırlanmış coin hesabı</b>: sıfıra düşmüş, satılamayan çöp coin tutar</li>
      <li><b>Honeypot hesabı</b>: sadece alınıp satılamayan coin, hesap kilitli</li>
      <li><b>Korumalı token</b>: SOL / USDT / USDC vb. (sistem dokunmaz)</li>
      <li><b>Geri alınamaz</b>: proje ekibinin closeAuthority kilitlediği hesap (zincirde kapatılamaz)</li>
    </ul>
    <p>Her hesapta "geri alınabilir SOL" gösterilir; ne kadar kira kilitli olduğunu, hangisinin geri alınabileceğini tek bakışta görürsün. TG botu <a href="https://t.me/solata_rent_bot" target="_blank" rel="noopener">@solata_rent_bot</a> ile de saniyeler içinde sorgulayabilirsin.</p>

    <h2>İkinci Adım: Cüzdanı Bağla</h2>
    <div class="step"><div class="step-num">1</div><div class="step-body"><h3>「Bağla ve Geri Al」 sekmesine geç</h3>Ana sayfada "🔗 Bağla ve Geri Al" sekmesine tıkla.</div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><h3>Cüzdanını bağla</h3>Phantom / Solflare / OKX / TokenPocket / Backpack gibi Solana cüzdanları desteklenir. Not: MetaMask bir Ethereum cüzdanıdır, Solana'yı desteklemez.</div></div>

    <h2>Üçüncü Adım: Tara ve Tek Tıkla Geri Al</h2>
    <p>"Tara ve Tek Tıkla Geri Al"a tıkla; sistem ilk adımdaki detaya göre otomatik işler: <b>0 bakiyeli hesaplar doğrudan kapatılır, sıfırlanmış ve honeypot coin'ler önce yakılır sonra kapatılır</b>, ardından cüzdan penceresinde işlemleri tek tek imzalayıp onaylarsın. Kapatılan her hesap için yaklaşık 0.002 SOL kira cüzdanına döner; platform yalnızca 0.0002 SOL (kiranın yaklaşık %10'u) komisyon alır, <b>yalnızca başarılı geri almada ücret alınır</b>.</p>

    <h2>Avantajımız: Üç hesap türünü de geri alabiliriz</h2>
    <p>Piyasadaki çoğu araç <b>yalnızca "boş hesapları" (0 bakiye) kapatabilir</b> — hesapta hâlâ token bakiyesi varsa geri alamaz, çünkü önce coin'i satıp hesabı sıfırlaman gerekir. Sıfırlanmış ve honeypot coin'ler zaten satılamadığından, sıradan araçlar onlarla başa çıkamaz.</p>
    <p>Biz <b>tam kapsama</b> sunarız:</p>
    <ul>
      <li>✅ <b>0 bakiyeli hesap</b> → doğrudan kapatılır, kira geri döner</li>
      <li>✅ <b>Sıfırlanmış coin hesabı</b> (coin var ama değersiz) → önce token yakılır, sonra hesap kapatılır, kira geri döner</li>
      <li>✅ <b>Honeypot hesabı</b> (sadece alınır, satılamaz) → önce token yakılır, sonra hesap kapatılır, kira geri döner</li>
    </ul>
    <blockquote>Tek cümle: hesap ister boş, ister sıfırlanmış coin tutsun, ister honeypot tutsun — hepsini yakıp kapatıp kirayı geri alabiliriz.</blockquote>

    <h2>Bonus: Pump.fun İşlem Hacmi Depozitosu (Akümülatör)</h2>
    <p>Eğer <b>pump.fun</b> üzerinde meme coin ticareti yaptıysan, pump.fun cüzdanına otomatik olarak bir "<b>işlem hacmi akümülatörü</b>" hesabı oluşturur ve yaklaşık <b>0.0018 SOL</b> depozito kilitler. Bazı hesaplarda cashback birikmiştir, birkaç SOL'a kadar çıkabilir.</p>
    <p>Bu hesap pump.fun programına bağlıdır, <b>normal bir token hesabı değildir</b>; bu yüzden piyasadaki çoğu araç (yalnızca Token / Token-2022 tarar) onu göremez — depoziton zincirde yatar. Biz bunu özel olarak tersine mühendislik yapıp destekledik:</p>
    <ul>
      <li>✅ <b>Tarama sırasında otomatik görünür</b>: cüzdanı bağladığında akümülatör depozitosu token hesaplarıyla birlikte listelenir</li>
      <li>✅ <b>Tek tıkla geri al</b>: akümülatör hesabı kapatılır, depozito + birikmiş cashback <b>cüzdanına döner (%10 komisyon düşülür)</b></li>
      <li>✅ <b>%10 komisyon</b>: depozito + cashback neti (%10 düşülerek), token hesabı kirasıyla aynı oran</li>
    </ul>
    <blockquote>Meme coin ticareti yapanların neredeyse hepsinde bu gizli depozito vardır — başkaları göremez, biz geri alırız.</blockquote>

    <div class="callout warn">
      <div class="callout-title">⚠️ Geri almadan önce mutlaka oku</div>
      Sistem, bakiyesi olan tüm token hesaplarını yakar (korumalı token'lar hariç). Geri almadan önce cüzdanındaki değerli coin'leri kendin taşı, yanlışlıkla yakmayı önlemek için. Korumalı token'lar <b>SOL / USDT / USDC / PYUSD / USDS / EURC</b> asla yakılmaz.
    </div>

    <div class="callout good">
      <div class="callout-title">🔐 Güvenlik taahhüdü</div>
      Özel anahtarın cüzdanından asla çıkmaz; tüm süreç yalnızca "token hesabını kapat / kirayı geri al" imzasıdır, SOL, USDT gibi varlıklarını transfer etmez. Kod <a href="https://github.com/SOLANAN-ATA/sol-ata-rent-recovery" target="_blank" rel="noopener">GitHub'da açık kaynak</a>.
    </div>

    <div class="cta">
      <div class="cta-title">Önce ne kadar kilitli olduğunu sorgula 👇</div>
      <div class="cta-sub">Cüzdan adresini gir, sıfırlanmış / 0 bakiyeli / honeypot hesap detaylarını gör</div>
      <a class="btn" href="/">Adres Sorgula</a>
    </div>

    <div class="related">
      <div class="related-title">İlgili Okuma</div>
      <a href="/tr/what-is-rent.html"><span class="rel-title">💡 ATA kirası nedir? SOL neden kilitlenir</span><span class="rel-desc">Solana token hesabı kira mekanizmasını anla, paranın nereye gittiğini kavra</span></a>
      <a href="/tr/faq.html"><span class="rel-title">❓ Kira geri alma SSS</span><span class="rel-desc">Ne kadar geri alınır? Yanlışlıkla yakılır mı? SOL yoksa ne olur?</span></a>
    </div>`,
    },
    ko: {
      title: "Solana 렌트 환급 튜토리얼: 3단계로 지갑에 잠긴 SOL 되찾기 | solata.top",
      desc: "Solana 렌트 환급 전체 튜토리얼: 먼저 주소 조회로 제로화/0보유/허니팟 계정 내역을 확인하고, 지갑을 연결해 좀비 계정을 원클릭 폐쇄해 ATA 렌트를 환급받으세요. Pump.fun 거래량 보증금(누적기)도 환급. 0보유·제로화·허니팟 계정 모두 환급 가능.",
      keywords: "solana 렌트 환급 튜토리얼, close token account, SOL 렌트 되찾기, ATA 렌트, solana 지갑 정리, 제로화 코인 렌트, 허니팟 렌트, pump.fun 거래량 보증금, 누적기 보증금",
      ogTitle: "Solana 렌트 환급 튜토리얼: 3단계로 지갑에 잠긴 SOL 되찾기 | solata.top",
      ogDesc: "0보유·제로화·허니팟 계정 모두 환급 가능. 먼저 주소 조회로 내역 확인 후 원클릭으로 좀비 계정 폐쇄, 렌트 환급.",
      jsonLd: {
        headline: "Solana 렌트 환급 튜토리얼: 3단계로 지갑에 잠긴 SOL 되찾기",
        description: "먼저 주소 조회로 제로화/0보유/허니팟 계정 내역을 확인하고, 지갑을 연결해 좀비 계정을 원클릭 폐쇄해 ATA 렌트를 환급받으세요.",
        inLanguage: "ko",
      },
      body: `
    <div class="breadcrumb"><a href="/">홈</a><span>/</span>튜토리얼</div>
    <h1>Solana 렌트 환급 튜토리얼: 3단계로 지갑에 잠긴 SOL 되찾기</h1>
    <p class="lead">Solana에서 제로화·쓰레기·허니팟·에어드랍 코인을 거래할 때마다 지갑이 자동으로 토큰 계정을 열고 약 0.002 SOL의 렌트를 잠급니다. 이 튜토리얼은 그것들을 단계별로 모두 되찾는 법을 알려드립니다.</p>

    <div class="callout info">
      <div class="callout-title">💡 한 줄 원리</div>
      Solana 체인은 각 토큰 계정(ATA)이 '렌트'를 예치하도록 규정합니다. 계정을 닫으면 렌트가 돌아오고, 닫지 못하면(코인이 안 팔리거나 잔액이 있으면) 그 SOL이 체인에 묶입니다. 저희가 이 좀비 계정을 닫아드립니다.
    </div>

    <h2>1단계: 주소 조회 —— 먼저 얼마나 잠겼는지, 어떤 계정이 있는지 확인</h2>
    <p>지갑 연결 없이, 먼저 홈의 <b>「🔍 주소 조회」</b>에 임의의 지갑 주소(본인·친구 모두 가능)를 입력하면 시스템이 자동으로 스캔해 모든 토큰 계정의 <b>상세 내역</b>을 나열합니다:</p>
    <ul>
      <li><b>0보유 계정</b>: 토큰이 없어 바로 폐쇄하고 렌트 환급 가능</li>
      <li><b>제로화 코인 계정</b>: 제로가 되어 팔 수 없는 쓰레기 코인 보유</li>
      <li><b>허니팟 계정</b>: 사기만 가능하고 팔 수 없는 코인, 계정이 잠김</li>
      <li><b>보호 토큰</b>: SOL / USDT / USDC 등 (시스템이 건드리지 않음)</li>
      <li><b>환급 불가</b>: 프로젝트 팀이 closeAuthority를 건 계정 (체인상 폐쇄 불가)</li>
    </ul>
    <p>각 계정에 '환급 가능 SOL'이 표시되어 렌트가 얼마나 잠겼는지, 무엇이 환급 가능한지 한눈에 보입니다. TG 봇 <a href="https://t.me/solata_rent_bot" target="_blank" rel="noopener">@solata_rent_bot</a>으로도 몇 초 만에 조회할 수 있습니다.</p>

    <h2>2단계: 지갑 연결</h2>
    <div class="step"><div class="step-num">1</div><div class="step-body"><h3>「연결 및 환급」 탭으로 이동</h3>홈에서 "🔗 연결 및 환급" 탭을 클릭하세요.</div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><h3>지갑 연결</h3>Phantom / Solflare / OKX / TokenPocket / Backpack 등 Solana 지갑을 지원합니다. 참고: MetaMask는 이더리움 지갑이라 Solana를 지원하지 않습니다.</div></div>

    <h2>3단계: 스캔 후 원클릭 환급</h2>
    <p>"스캔 후 원클릭 환급"을 클릭하면 시스템이 1단계 내역에 따라 자동 처리합니다: <b>0보유 계정은 바로 폐쇄, 제로화·허니팟 코인은 먼저 소각 후 폐쇄</b>한 뒤 지갑 팝업에서 거래를 하나씩 서명 확인합니다. 계정을 닫을 때마다 약 0.002 SOL 렌트가 지갑으로 돌아오고, 플랫폼은 0.0002 SOL(렌트의 약 10%)만 받으며 <b>환급 성공 시에만 수수료를 받습니다</b>.</p>

    <h2>우리의 장점: 세 가지 계정 모두 환급 가능</h2>
    <p>시중 대부분 도구는 <b>'빈 계정'(0보유)만 닫을 수 있습니다</b> — 계정에 토큰 잔액이 남아 있으면 환급하지 못합니다. 코인을 팔아 계정을 0으로 만들어야 하기 때문입니다. 제로화·허니팟 코인은 애초에 팔 수 없으므로 일반 도구로는 어쩔 수 없습니다.</p>
    <p>저희는 <b>전부 커버</b>합니다:</p>
    <ul>
      <li>✅ <b>0보유 계정</b> → 바로 폐쇄, 렌트 환급</li>
      <li>✅ <b>제로화 코인 계정</b> (코인은 있지만 무가치) → 토큰을 먼저 소각하고 계정 폐쇄, 렌트 환급</li>
      <li>✅ <b>허니팟 계정</b> (사기만 가능, 팔 수 없음) → 토큰을 먼저 소각하고 계정 폐쇄, 렌트 환급</li>
    </ul>
    <blockquote>한 줄 요약: 계정이 비어 있든, 제로화 코인을 담고 있든, 허니팟을 담고 있든 — 모두 소각·폐쇄해서 렌트를 되찾아 드립니다.</blockquote>

    <h2>보너스: Pump.fun 거래량 보증금 (누적기)</h2>
    <p><b>pump.fun</b>에서 밈 코인을 거래했다면, pump.fun이 지갑에 자동으로 '<b>거래량 누적기</b>' 계정을 만들고 약 <b>0.0018 SOL</b>의 보증금을 잠급니다. 일부 계정에는 캐시백이 쌓여 여러 SOL에 달하기도 합니다.</p>
    <p>이 계정은 pump.fun 프로그램에 속해 <b>일반 토큰 계정이 아니므로</b>, 시중 대부분 도구(Token / Token-2022만 스캔)는 찾지 못합니다 — 보증금이 체인에 그대로 남습니다. 저희가 이를 역공학으로 지원했습니다:</p>
    <ul>
      <li>✅ <b>스캔 시 자동 표시</b>: 지갑 연결 후 누적기 보증금이 토큰 계정과 함께 나열됩니다</li>
      <li>✅ <b>원클릭 환급</b>: 누적기 계정을 닫아 보증금 + 누적 캐시백을 <b>지갑으로 환급 (10% 수수료 차감)</b></li>
      <li>✅ <b>10% 수수료</b>: 보증금 + 캐시백 순액(10% 차감), 토큰 계정 렌트와 동일 요율</li>
    </ul>
    <blockquote>밈 코인 트레이더라면 거의 모두 이 숨은 보증금이 있습니다 — 남들은 못 찾지만 저희가 환급해 드립니다.</blockquote>

    <div class="callout warn">
      <div class="callout-title">⚠️ 환급 전 필독</div>
      시스템은 잔액이 있는 모든 토큰 계정을 소각합니다(보호 토큰 제외). 환급 전에 지갑의 가치 있는 코인을 직접 옮겨 실수로 소각되는 것을 막으세요. 보호 토큰 <b>SOL / USDT / USDC / PYUSD / USDS / EURC</b>는 절대 소각되지 않습니다.
    </div>

    <div class="callout good">
      <div class="callout-title">🔐 보안 약속</div>
      개인키는 지갑을 절대 떠나지 않습니다. 모든 과정은 '토큰 계정 폐쇄 / 렌트 환급' 서명뿐이며 SOL, USDT 등 자산을 보내지 않습니다. 코드는 <a href="https://github.com/SOLANAN-ATA/sol-ata-rent-recovery" target="_blank" rel="noopener">GitHub에 오픈소스</a>입니다.
    </div>

    <div class="cta">
      <div class="cta-title">얼마나 잠겼는지 먼저 조회 👇</div>
      <div class="cta-sub">지갑 주소를 입력해 제로화 / 0보유 / 허니팟 계정 내역 확인</div>
      <a class="btn" href="/">주소 조회 시작</a>
    </div>

    <div class="related">
      <div class="related-title">관련 읽기</div>
      <a href="/ko/what-is-rent.html"><span class="rel-title">💡 ATA 렌트란? SOL이 잠기는 이유</span><span class="rel-desc">Solana 토큰 계정 렌트 메커니즘을 이해하고 돈이 어디로 갔는지 파악</span></a>
      <a href="/ko/faq.html"><span class="rel-title">❓ 렌트 환급 자주 묻는 질문 FAQ</span><span class="rel-desc">얼마나 환급? 실수로 소각? SOL이 없으면?</span></a>
    </div>`,
    },
    ja: {
      title: "Solana レント返金チュートリアル: 3ステップでロックされた SOL を取り戻す | solata.top",
      desc: "Solana レント返金の完全チュートリアル: まずアドレス照会でゼロ化・0保有・ハニーポット口座の内訳を確認し、ウォレットを接続してゾンビ口座をワンクリックで閉鎖して ATA レントを返金。Pump.fun 取引量デポジット(アキュムレータ)も返金。0保有・ゼロ化・ハニーポット口座すべて返金可能。",
      keywords: "solana レント返金チュートリアル, close token account, SOL レント回収, ATA レント, solana ウォレット整理, ゼロ化コイン レント, ハニーポット レント, pump.fun 取引量デポジット, アキュムレータ デポジット",
      ogTitle: "Solana レント返金チュートリアル: 3ステップでロックされた SOL を取り戻す | solata.top",
      ogDesc: "0保有・ゼロ化・ハニーポット口座すべて返金可能。まずアドレス照会で内訳を確認し、ワンクリックでゾンビ口座を閉鎖してレントを返金。",
      jsonLd: {
        headline: "Solana レント返金チュートリアル: 3ステップでロックされた SOL を取り戻す",
        description: "まずアドレス照会でゼロ化・0保有・ハニーポット口座の内訳を確認し、ウォレットを接続してゾンビ口座をワンクリックで閉鎖して ATA レントを返金。",
        inLanguage: "ja",
      },
      body: `
    <div class="breadcrumb"><a href="/">ホーム</a><span>/</span>チュートリアル</div>
    <h1>Solana レント返金チュートリアル: 3ステップでロックされた SOL を取り戻す</h1>
    <p class="lead">Solana でゼロ化・ゴミ・ハニーポット・エアドロップコインを取引するたびに、ウォレットは自動でトークンアカウントを開設し、約 0.002 SOL のレントをロックします。このチュートリアルでは、それらをステップごとにすべて取り戻す方法を解説します。</p>

    <div class="callout info">
      <div class="callout-title">💡 ひとことで原理</div>
      Solana チェーンは、各トークンアカウント(ATA)に「レント」を預けるよう定めています。口座を閉じられればレントが戻り、閉じられなければ(コインが売れず残高がある場合)その SOL はチェーンに固定されます。私たちはそのゾンビ口座を閉鎖します。
    </div>

    <h2>第1ステップ: アドレス照会 —— まずいくらロックされているか、どの口座があるか確認</h2>
    <p>ウォレットを接続せず、まずホームの <b>「🔍 アドレス照会」</b>に任意のウォレットアドレス(自分・友人のどちらでも)を入力すると、システムが自動スキャンし全トークンアカウントの<b>内訳</b>を一覧表示します:</p>
    <ul>
      <li><b>0保有口座</b>: トークンがなく、直接閉鎖してレント返金可能</li>
      <li><b>ゼロ化コイン口座</b>: ゼロになり売れないゴミコインを保持</li>
      <li><b>ハニーポット口座</b>: 買うだけで売れないハニーポット、口座がロック</li>
      <li><b>保護トークン</b>: SOL / USDT / USDC など (システムは触れません)</li>
      <li><b>返金不可</b>: プロジェクトチームが closeAuthority を設定した口座 (チェーン上で閉鎖不可)</li>
    </ul>
    <p>各口座に「返金可能 SOL」が表示され、いくらロックされているか、どれが返金可能かが一目で分かります。TG ボット <a href="https://t.me/solata_rent_bot" target="_blank" rel="noopener">@solata_rent_bot</a> でも数秒で照会できます。</p>

    <h2>第2ステップ: ウォレットを接続</h2>
    <div class="step"><div class="step-num">1</div><div class="step-body"><h3>「接続して返金」タブへ</h3>ホームで「🔗 接続して返金」タブをクリック。</div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><h3>ウォレットを接続</h3>Phantom / Solflare / OKX / TokenPocket / Backpack などの Solana ウォレットに対応。注意: MetaMask はイーサリアムウォレットで Solana 非対応です。</div></div>

    <h2>第3ステップ: スキャンしてワンクリック返金</h2>
    <p>「スキャンしてワンクリック返金」をクリックすると、システムが第1ステップの内訳に沿って自動処理します: <b>0保有口座は直接閉鎖、ゼロ化・ハニーポットコインは先に焼却してから閉鎖</b>し、ウォレットのポップアップでトランザクションを1件ずつ署名確認します。口座を閉じるごとに約 0.002 SOL のレントがウォレットに戻り、プラットフォームは 0.0002 SOL(レントの約 10%)のみを受け取り、<b>返金成功時のみ課金</b>されます。</p>

    <h2>私たちの強み: 3種類の口座すべて返金可能</h2>
    <p>市場のほとんどのツールは <b>「空の口座」(0保有)しか閉じられません</b> — 口座にトークン残高が残っていると返金できません。コインを売って口座をゼロにする必要があるからです。ゼロ化・ハニーポットコインはそもそも売れないので、普通のツールでは対処できません。</p>
    <p>私たちは<b>全カバー</b>します:</p>
    <ul>
      <li>✅ <b>0保有口座</b> → 直接閉鎖、レント返金</li>
      <li>✅ <b>ゼロ化コイン口座</b> (コインはあるが無価値) → トークンを先に焼却して口座閉鎖、レント返金</li>
      <li>✅ <b>ハニーポット口座</b> (買うだけで売れない) → トークンを先に焼却して口座閉鎖、レント返金</li>
    </ul>
    <blockquote>ひとこと: 口座が空でも、ゼロ化コインでも、ハニーポットでも — すべて焼却・閉鎖してレントを取り戻せます。</blockquote>

    <h2>ボーナス: Pump.fun 取引量デポジット (アキュムレータ)</h2>
    <p><b>pump.fun</b> でミームコインを取引した場合、pump.fun がウォレットに自動で「<b>取引量アキュムレータ</b>」口座を作成し、約 <b>0.0018 SOL</b> のデポジットをロックします。口座によってはキャッシュバックが溜まり、数 SOL に達することもあります。</p>
    <p>この口座は pump.fun プログラム配下で <b>通常のトークンアカウントではないため</b>、市場の大半のツール(Token / Token-2022 のみスキャン)には見えません — デポジットはチェーン上に残ったままです。私たちはこれをリバースエンジニアリングして対応しました:</p>
    <ul>
      <li>✅ <b>スキャン時に自動表示</b>: ウォレット接続後、アキュムレータデポジットがトークンアカウントと一緒に一覧表示</li>
      <li>✅ <b>ワンクリック返金</b>: アキュムレータ口座を閉じ、デポジット + 累積キャッシュバックを <b>ウォレットへ返金 (10% 手数料差引)</b></li>
      <li>✅ <b>10% 手数料</b>: デポジット + キャッシュバックの純額(10% 差引)、トークンアカウントのレントと同じ料率</li>
    </ul>
    <blockquote>ミームコイン取引をした人ならほぼ全員にこの隠れたデポジットがあります — 他には見えませんが、私たちが返金します。</blockquote>

    <div class="callout warn">
      <div class="callout-title">⚠️ 返金前に必読</div>
      システムは残高のあるすべてのトークンアカウントを焼却します(保護トークンを除く)。返金前にウォレット内の価値あるコインを自分で移動し、誤焼却を防いでください。保護トークン <b>SOL / USDT / USDC / PYUSD / USDS / EURC</b> は絶対に焼却されません。
    </div>

    <div class="callout good">
      <div class="callout-title">🔐 安全の約束</div>
      秘密鍵はウォレットから一切出ません。全工程は「トークンアカウント閉鎖 / レント返金」の署名のみで、SOL や USDT などの資産を送ることはありません。コードは <a href="https://github.com/SOLANAN-ATA/sol-ata-rent-recovery" target="_blank" rel="noopener">GitHub でオープンソース</a>です。
    </div>

    <div class="cta">
      <div class="cta-title">まずいくらロックされているか照会 👇</div>
      <div class="cta-sub">ウォレットアドレスを入力し、ゼロ化 / 0保有 / ハニーポット口座の内訳を確認</div>
      <a class="btn" href="/">アドレス照会を始める</a>
    </div>

    <div class="related">
      <div class="related-title">関連記事</div>
      <a href="/ja/what-is-rent.html"><span class="rel-title">💡 ATA レントとは? SOL がロックされる理由</span><span class="rel-desc">Solana トークンアカウントのレントの仕組みを理解し、お金の行方を把握</span></a>
      <a href="/ja/faq.html"><span class="rel-title">❓ レント返金のよくある質問 FAQ</span><span class="rel-desc">いくら返金? 誤って焼却? SOL がない場合は?</span></a>
    </div>`,
    },
  },

  faq: {
    tr: {
      title: "Solana Kira Geri Alma SSS | solata.top",
      desc: "Solana kira geri alma SSS: Her hesaptan ne kadar SOL geri alınır? Değerli coin yanlışlıkla yakılır mı? SOL yokken geri alınabilir mi? Geri alınamaz ne demek? Pump.fun işlem hacmi depozitosu nedir? Ücret ne kadar? Güvenli mi?",
      keywords: "solana kira geri alma SSS, close token account, token hesabı kapatma, ATA kirası geri alma, solana cüzdan temizliği SSS, pump.fun işlem hacmi depozitosu, akümülatör depozitosu",
      ogTitle: "Solana Kira Geri Alma SSS | solata.top",
      ogDesc: "Ne kadar SOL geri alınır? Değerli coin yanlışlıkla yakılır mı? SOL yokken geri alınabilir mi? Tüm sorular tek cevapta.",
      jsonLd: [
        ["Her token hesabından ne kadar SOL geri alınır?", "Yaklaşık 0.00203928 SOL; bu, Solana zincirindeki her token hesabının (ATA) standart kirasıdır. Ne kadar çok sıfırlanmış coin'e girdiysen, o kadar çok kira geri alabilirsin."],
        ["Cüzdanımda ne kadar kira kilitli olduğunu nasıl kontrol ederim?", "İki yol: cüzdan adresini @solata_rent_bot TG botuna gönder, saniyeler içinde sonucu verir; veya solata.top'u açıp cüzdanını bağla."],
        ["Değerli coin'lerim yanlışlıkla yakar mı?", "Korumalı token'lar SOL / USDT / USDC / PYUSD / USDS / EURC asla yakılmaz. Bakiyesi olan diğer token hesapları yakılıp kira geri alınır; bu yüzden geri almadan önce değerli coin'lerini kendin taşı."],
        ["Cüzdanımda SOL kalmadı, yine de geri alabilir miyim?", "Geri alma, zincir üstü ücret olarak çok az SOL gerektirir (imza başına ~0.000005 SOL). Bakiye 0 ise önce biraz SOL yükle."],
        ["Neden bazı hesaplar 'Geri Alınamaz' görünüyor?", "Bazı proje ekipleri token'a closeAuthority atar; bu hesaplar zincirde kapatılamaz. closeAuthority olmayan diğer hesapların kirası geri alınabilir."],
        ["Platform ne kadar komisyon alıyor?", "Hesap başına 0.0002 SOL, kiranın (0.002 SOL) yaklaşık %10'u. Yalnızca başarılı geri almada ücret alınır; 0 SOL ile de geri alınabilir."],
        ["Sıfırlanmış ve honeypot gibi bakiyesi olan hesaplar geri alınabilir mi?", "Evet. Bu bizim çekirdek avantajımız: 0 bakiyeli hesaplar doğrudan kapatılır; sıfırlanmış ve honeypot gibi bakiyesi olup satılamayan hesaplarda önce token yakılır, sonra hesap kapatılıp kira geri alınır. Piyasadaki çoğu araç yalnızca boş hesapları geri alabilir."],
        ["Güvenli mi? Özel anahtarım alınır mı?", "Özel anahtarın cüzdanından asla çıkmaz. Tüm süreç yalnızca 'token hesabını kapat / kirayı geri al' imzasıdır; SOL, USDT gibi varlıklarını transfer etmez. Kod GitHub'da açık kaynaktır."],
        ["Pump.fun işlem hacmi depozitosu (akümülatör) nedir?", "pump.fun'da meme coin ticareti yaparken pump.fun otomatik olarak 'işlem hacmi akümülatörü' hesabı oluşturur ve ~0.0018 SOL depozito kilitler; bazı hesaplarda cashback de birikir. pump.fun programına bağlıdır, normal token hesabı değildir, bu yüzden çoğu araç göremez. solata.top bulur ve neti (depozito+cashback, %10 komisyon düşülerek) geri verir."],
      ],
      body: `
    <div class="breadcrumb"><a href="/">Ana Sayfa</a><span>/</span>SSS</div>
    <h1>Solana Kira Geri Alma SSS</h1>
    <p class="lead">Kira geri alma, hesap kapatma, ücret ve güvenlik hakkındaki tüm sorular tek yerde.</p>

    <details class="faq" open>
      <summary>Her token hesabından ne kadar SOL geri alınır?</summary>
      <p>Yaklaşık <b>0.00203928 SOL</b>; bu, Solana zincirindeki her token hesabının (ATA) standart kirasıdır. Ne kadar çok sıfırlanmış coin'e girdiysen, o kadar çok kira geri alabilirsin.</p>
    </details>
    <details class="faq">
      <summary>Cüzdanımda ne kadar kira kilitli olduğunu nasıl kontrol ederim?</summary>
      <p>İki yol: ① cüzdan adresini TG botuna <a href="https://t.me/solata_rent_bot" target="_blank" rel="noopener">@solata_rent_bot</a> gönder, saniyeler içinde ne kadar SOL kilitli olduğunu söyler; ② <a href="/">solata.top</a>'u açıp cüzdanını bağla.</p>
    </details>
    <details class="faq">
      <summary>Değerli coin'lerim yanlışlıkla yakar mı?</summary>
      <p>Korumalı token'lar <b>SOL / USDT / USDC / PYUSD / USDS / EURC</b> asla yakılmaz. Bakiyesi olan diğer token hesapları yakılıp kira geri alınır; bu yüzden <b>geri almadan önce cüzdanındaki değerli coin'leri kendin taşı</b>, yanlışlıkla yakmayı önlemek için.</p>
    </details>
    <details class="faq">
      <summary>Sıfırlanmış ve honeypot gibi bakiyesi olan hesaplar geri alınabilir mi?</summary>
      <p><b>Evet, bu bizim çekirdek avantajımız.</b> 0 bakiyeli hesaplar doğrudan kapatılır; sıfırlanmış ve honeypot gibi bakiyesi olup satılamayan hesaplarda önce token yakılır, sonra hesap kapatılıp kira geri alınır. Piyasadaki çoğu araç <b>yalnızca boş hesapları geri alabilir, bakiyesi olanı geri alamaz</b> — çünkü sıfırlanmış ve honeypot coin'ler satılamaz, hesap sıfırlanamaz.</p>
    </details>
    <details class="faq">
      <summary>Cüzdanımda SOL kalmadı, yine de geri alabilir miyim?</summary>
      <p>Geri alma, zincir üstü ücret olarak çok az SOL gerektirir (imza başına ~0.000005 SOL). Bakiye 0 ise önce biraz SOL yükle.</p>
    </details>
    <details class="faq">
      <summary>Neden bazı hesaplar 'Geri Alınamaz' görünüyor?</summary>
      <p>Bazı proje ekipleri token'a <code>closeAuthority</code> (kapatma yetkisi) atar; bu hesaplar zincirde kapatılamaz. closeAuthority olmayan diğer hesapların kirası geri alınabilir.</p>
    </details>
    <details class="faq">
      <summary>Platform ne kadar komisyon alıyor?</summary>
      <p>Hesap başına <b>0.0002 SOL</b>, kiranın (0.002 SOL) yaklaşık <b>%10</b>'u. Yalnızca başarılı geri almada ücret alınır, <b>0 SOL ile de geri alınabilir</b>.</p>
    </details>
    <details class="faq">
      <summary>Güvenli mi? Özel anahtarım alınır mı?</summary>
      <p><b>Özel anahtarın cüzdanından asla çıkmaz</b>. Tüm süreç yalnızca 'token hesabını kapat / kirayı geri al' imzasıdır; SOL, USDT gibi varlıklarını transfer etmez. Kod <a href="https://github.com/SOLANAN-ATA/sol-ata-rent-recovery" target="_blank" rel="noopener">GitHub'da açık kaynak</a>.</p>
    </details>
    <details class="faq">
      <summary>Hesap çok olursa ne olur?</summary>
      <p>Hesap çoksa otomatik olarak birden fazla işleme bölünür, her işlem yaklaşık 20 hesap içerir ve cüzdanda birkaç kez imza onaylaman gerekir.</p>
    </details>
    <details class="faq">
      <summary>Pump.fun işlem hacmi depozitosu (akümülatör) nedir?</summary>
      <p><b>pump.fun</b>'da meme coin ticareti yaparken pump.fun cüzdanına otomatik olarak '<b>işlem hacmi akümülatörü</b>' hesabı oluşturur ve yaklaşık <b>0.0018 SOL</b> depozito kilitler; bazı hesaplarda cashback de birikir (birkaç SOL'a kadar). pump.fun programına bağlıdır, <b>normal token hesabı değildir</b>, bu yüzden çoğu araç göremez. solata.top bulur ve <b>neti</b> (depozito + cashback, <b>%10 komisyon düşülerek</b>) geri verir.</p>
    </details>
    <details class="faq">
      <summary>Neden diğer araçlar bu depozitoyu göremiyor?</summary>
      <p>Çünkü çoğu araç <b>yalnızca Token / Token-2022 programlarının token hesaplarını tarar</b>; Pump.fun akümülatörü ise pump.fun'ın kendi programına bağlıdır, ikinci tür gizli varlıktır. Bu bizim teknik hendeğimiz — özel olarak tersine mühendislik yapıp destekledik.</p>
    </details>

    <div class="cta">
      <div class="cta-title">Hâlâ soru var mı? Doğrudan dene 👇</div>
      <div class="cta-sub">Cüzdanı bağla, tarama sonrası sonuç net</div>
      <a class="btn" href="/">Taramaya Başla</a>
    </div>

    <div class="related">
      <div class="related-title">İlgili Okuma</div>
      <a href="/tr/guide.html"><span class="rel-title">📖 Solana Kira Geri Alma Tam Rehberi</span><span class="rel-desc">3 adımda kilitli SOL'unu geri al</span></a>
      <a href="/tr/what-is-rent.html"><span class="rel-title">💡 ATA kirası nedir?</span><span class="rel-desc">Solana token hesabı kira mekanizmasını anla</span></a>
    </div>`,
    },
    ko: {
      title: "Solana 렌트 환급 자주 묻는 질문 FAQ | solata.top",
      desc: "Solana 렌트 환급 FAQ: 계정당 얼마나 많은 SOL을 환급받나요? 가치 있는 코인을 실수로 소각하나요? SOL이 없어도 환급 가능? 환급 불가란? Pump.fun 거래량 보증금은? 수수료는? 안전한가요?",
      keywords: "solana 렌트 환급 FAQ, close token account, 토큰 계정 폐쇄, ATA 렌트 환급, solana 지갑 정리 FAQ, pump.fun 거래량 보증금, 누적기 보증금",
      ogTitle: "Solana 렌트 환급 자주 묻는 질문 FAQ | solata.top",
      ogDesc: "얼마나 환급? 가치 있는 코인 실수로 소각? SOL 없이 환급 가능? 모든 궁금증을 한 번에.",
      jsonLd: [
        ["토큰 계정당 얼마나 많은 SOL을 환급받나요?", "약 0.00203928 SOL로, Solana 체인에서 각 토큰 계정(ATA)의 표준 렌트입니다. 거래한 제로화 코인이 많을수록 환급받을 렌트가 많아집니다."],
        ["내 지갑에 렌트가 얼마나 잠겼는지 어떻게 확인하나요?", "두 가지 방법: 지갑 주소를 @solata_rent_bot TG 봇에 보내면 몇 초 만에 알려줍니다; 또는 solata.top을 열어 지갑을 연결해 확인."],
        ["가치 있는 코인을 실수로 소각하지 않을까요?", "보호 토큰 SOL / USDT / USDC / PYUSD / USDS / EURC는 절대 소각되지 않습니다. 잔액이 있는 다른 토큰 계정은 소각 후 렌트가 환급되므로, 환급 전에 가치 있는 코인을 직접 옮기세요."],
        ["지갑에 SOL이 없는데 환급받을 수 있나요?", "환급에는 체인 수수료로 소량의 SOL(서명당 약 0.000005 SOL)이 필요합니다. 잔액이 0이면 SOL을 조금 충전하세요."],
        ["일부 계정이 '환급 불가'로 표시되는 이유는?", "일부 프로젝트 팀이 토큰에 closeAuthority를 설정하면 그 계정은 체인상에서 닫을 수 없습니다. closeAuthority가 없는 나머지 계정은 렌트를 환급받을 수 있습니다."],
        ["플랫폼 수수료는 얼마인가요?", "계정당 0.0002 SOL, 렌트(0.002 SOL)의 약 10%입니다. 환급 성공 시에만 수수료를 받으며, 0 SOL로도 환급 가능합니다."],
        ["제로화·허니팟처럼 잔액이 있는 계정도 환급되나요?", "네. 이것이 핵심 장점입니다: 0보유 계정은 바로 폐쇄, 제로화·허니팟처럼 잔액은 있지만 팔 수 없는 계정은 토큰을 먼저 소각하고 계정을 닫아 렌트를 환급합니다. 시중 대부분 도구는 빈 계정만 환급할 수 있습니다."],
        ["안전한가요? 개인키를 가져가나요?", "개인키는 지갑을 절대 떠나지 않습니다. 모든 과정은 '토큰 계정 폐쇄 / 렌트 환급' 서명뿐이며 SOL, USDT 등 자산을 보내지 않습니다. 코드는 GitHub에 오픈소스입니다."],
        ["Pump.fun 거래량 보증금(누적기)이란?", "pump.fun에서 밈 코인을 거래하면 pump.fun이 자동으로 '거래량 누적기' 계정을 만들고 약 0.0018 SOL 보증금을 잠급니다. 일부 계정에는 캐시백도 쌓입니다. pump.fun 프로그램에 속해 일반 토큰 계정이 아니므로 대부분 도구가 못 찾습니다. solata.top이 찾아 순액(보증금+캐시백, 10% 수수료 차감)을 환급합니다."],
      ],
      body: `
    <div class="breadcrumb"><a href="/">홈</a><span>/</span>FAQ</div>
    <h1>Solana 렌트 환급 자주 묻는 질문 (FAQ)</h1>
    <p class="lead">렌트 환급, 계정 폐쇄, 수수료, 보안에 대한 모든 궁금증을 한 번에 정리했습니다.</p>

    <details class="faq" open>
      <summary>토큰 계정당 얼마나 많은 SOL을 환급받나요?</summary>
      <p>약 <b>0.00203928 SOL</b>로, Solana 체인에서 각 토큰 계정(ATA)의 표준 렌트입니다. 거래한 제로화 코인이 많을수록 환급받을 렌트가 많아집니다.</p>
    </details>
    <details class="faq">
      <summary>내 지갑에 렌트가 얼마나 잠겼는지 어떻게 확인하나요?</summary>
      <p>두 가지 방법: ① 지갑 주소를 TG 봇 <a href="https://t.me/solata_rent_bot" target="_blank" rel="noopener">@solata_rent_bot</a>에 보내면 몇 초 만에 잠긴 SOL을 알려줍니다; ② <a href="/">solata.top</a>을 열어 지갑을 연결해 확인.</p>
    </details>
    <details class="faq">
      <summary>가치 있는 코인을 실수로 소각하지 않을까요?</summary>
      <p>보호 토큰 <b>SOL / USDT / USDC / PYUSD / USDS / EURC</b>는 절대 소각되지 않습니다. 잔액이 있는 다른 토큰 계정은 소각 후 렌트가 환급되므로, <b>환급 전에 지갑의 가치 있는 코인을 직접 옮겨</b> 실수로 소각되는 것을 막으세요.</p>
    </details>
    <details class="faq">
      <summary>제로화·허니팟처럼 잔액이 있는 계정도 환급되나요?</summary>
      <p><b>네, 이것이 핵심 장점입니다.</b> 0보유 계정은 바로 폐쇄, 제로화·허니팟처럼 잔액은 있지만 팔 수 없는 계정은 토큰을 먼저 소각하고 계정을 닫아 렌트를 환급합니다. 시중 대부분 도구는 <b>빈 계정만 환급할 수 있고, 잔액이 있는 계정은 환급하지 못합니다</b> — 제로화·허니팟 코인은 팔 수 없어 계정을 0으로 만들 수 없기 때문입니다.</p>
    </details>
    <details class="faq">
      <summary>지갑에 SOL이 없는데 환급받을 수 있나요?</summary>
      <p>환급에는 체인 수수료로 소량의 SOL(서명당 약 0.000005 SOL)이 필요합니다. 잔액이 0이면 SOL을 조금만 충전하면 됩니다.</p>
    </details>
    <details class="faq">
      <summary>일부 계정이 '환급 불가'로 표시되는 이유는?</summary>
      <p>일부 프로젝트 팀이 토큰에 <code>closeAuthority</code>(폐쇄 권한)를 설정하면 그 계정은 체인상에서 닫을 수 없습니다. closeAuthority가 없는 나머지 계정은 렌트를 환급받을 수 있습니다.</p>
    </details>
    <details class="faq">
      <summary>플랫폼 수수료는 얼마인가요?</summary>
      <p>계정당 <b>0.0002 SOL</b>, 렌트(0.002 SOL)의 약 <b>10%</b>입니다. 환급 성공 시에만 수수료를 받으며, <b>0 SOL로도 환급 가능</b>합니다.</p>
    </details>
    <details class="faq">
      <summary>안전한가요? 개인키를 가져가나요?</summary>
      <p><b>개인키는 지갑을 절대 떠나지 않습니다</b>. 모든 과정은 '토큰 계정 폐쇄 / 렌트 환급' 서명뿐이며 SOL, USDT 등 자산을 보내지 않습니다. 코드는 <a href="https://github.com/SOLANAN-ATA/sol-ata-rent-recovery" target="_blank" rel="noopener">GitHub에 오픈소스</a>입니다.</p>
    </details>
    <details class="faq">
      <summary>계정이 많으면 어떻게 되나요?</summary>
      <p>계정이 많으면 자동으로 여러 건으로 나뉘고, 건당 약 20개 계정씩 지갑에서 여러 번 서명을 확인해야 합니다.</p>
    </details>
    <details class="faq">
      <summary>Pump.fun 거래량 보증금(누적기)이란?</summary>
      <p><b>pump.fun</b>에서 밈 코인을 거래하면 pump.fun이 지갑에 자동으로 '<b>거래량 누적기</b>' 계정을 만들고 약 <b>0.0018 SOL</b> 보증금을 잠급니다. 일부 계정에는 캐시백도 쌓입니다(여러 SOL에 달하기도). pump.fun 프로그램에 속해 <b>일반 토큰 계정이 아니므로</b> 대부분 도구가 못 찾습니다. solata.top이 찾아 <b>순액</b>(보증금 + 캐시백, <b>10% 수수료 차감</b>)을 환급합니다.</p>
    </details>
    <details class="faq">
      <summary>왜 다른 도구는 이 보증금을 못 찾나요?</summary>
      <p>대부분 도구는 <b>Token / Token-2022 두 프로그램의 토큰 계정만 스캔</b>하기 때문입니다. Pump.fun 누적기는 pump.fun 자체 프로그램에 속한 두 번째 유형의 숨은 자산입니다. 이것이 우리의 기술적 해자입니다 — 역공학으로 지원했습니다.</p>
    </details>

    <div class="cta">
      <div class="cta-title">궁금한 점이 더? 직접 해보세요 👇</div>
      <div class="cta-sub">지갑을 연결하면 스캔 후 결과가 명확합니다</div>
      <a class="btn" href="/">스캔 및 환급 시작</a>
    </div>

    <div class="related">
      <div class="related-title">관련 읽기</div>
      <a href="/ko/guide.html"><span class="rel-title">📖 Solana 렌트 환급 전체 튜토리얼</span><span class="rel-desc">3단계로 잠긴 SOL 되찾기</span></a>
      <a href="/ko/what-is-rent.html"><span class="rel-title">💡 ATA 렌트란?</span><span class="rel-desc">Solana 토큰 계정 렌트 메커니즘 이해</span></a>
    </div>`,
    },
    ja: {
      title: "Solana レント返金のよくある質問 FAQ | solata.top",
      desc: "Solana レント返金 FAQ: 各口座からいくらの SOL を返金できますか? 価値あるコインを誤って焼却しませんか? SOL がなくても返金できますか? 返金不可とは? Pump.fun 取引量デポジットとは? 手数料は? 安全ですか?",
      keywords: "solana レント返金 FAQ, close token account, トークンアカウント閉鎖, ATA レント返金, solana ウォレット整理 FAQ, pump.fun 取引量デポジット, アキュムレータ デポジット",
      ogTitle: "Solana レント返金のよくある質問 FAQ | solata.top",
      ogDesc: "いくら返金? 価値あるコインを誤って焼却? SOL なしで返金可能? 疑問をまとめて解決。",
      jsonLd: [
        ["各トークンアカウントからいくらの SOL を返金できますか?", "約 0.00203928 SOL で、これは Solana チェーン上の各トークンアカウント(ATA)の標準レントです。取引したゼロ化コインが多いほど、返金できるレントが増えます。"],
        ["ウォレットにどれだけレントがロックされているか確認するには?", "2 つの方法: ウォレットアドレスを @solata_rent_bot TG ボットに送ると数秒で返答します; または solata.top を開いてウォレットを接続して確認。"],
        ["価値あるコインを誤って焼却しませんか?", "保護トークン SOL / USDT / USDC / PYUSD / USDS / EURC は絶対に焼却されません。残高のある他のトークンアカウントは焼却してレントが返金されるため、返金前に価値あるコインを自分で移動してください。"],
        ["ウォレットに SOL がない場合でも返金できますか?", "返金にはチェーン上の手数料としてごく少量の SOL(署名あたり約 0.000005 SOL)が必要です。残高が 0 なら少しチャージしてください。"],
        ["一部の口座が「返金不可」と表示されるのはなぜ?", "一部のプロジェクトチームがトークンに closeAuthority を設定すると、その口座はチェーン上で閉鎖できません。closeAuthority がない他の口座はレントを返金できます。"],
        ["プラットフォームの手数料はいくらですか?", "口座あたり 0.0002 SOL、レント(0.002 SOL)の約 10% です。返金成功時のみ課金され、0 SOL でも返金できます。"],
        ["ゼロ化・ハニーポットのように残高のある口座も返金できますか?", "はい。これが私たちの強みです: 0保有口座は直接閉鎖、ゼロ化・ハニーポットのように残高はあるが売れない口座はトークンを先に焼却してから閉鎖しレントを返金します。市場の大半のツールは空の口座しか返金できません。"],
        ["安全ですか? 秘密鍵を取られますか?", "秘密鍵はウォレットから一切出ません。全工程は「トークンアカウント閉鎖 / レント返金」の署名のみで、SOL や USDT などの資産を送ることはありません。コードは GitHub でオープンソースです。"],
        ["Pump.fun 取引量デポジット(アキュムレータ)とは?", "pump.fun でミームコインを取引すると、pump.fun が自動で「取引量アキュムレータ」口座を作成し約 0.0018 SOL のデポジットをロックします。一部の口座にはキャッシュバックも溜まります。pump.fun プログラム配下で通常のトークンアカウントではないため、大半のツールには見えません。solata.top が見つけ、純額(デポジット+キャッシュバック、10% 手数料差引)を返金します。"],
      ],
      body: `
    <div class="breadcrumb"><a href="/">ホーム</a><span>/</span>FAQ</div>
    <h1>Solana レント返金のよくある質問 (FAQ)</h1>
    <p class="lead">レント返金・口座閉鎖・手数料・安全についての疑問をまとめて解決します。</p>

    <details class="faq" open>
      <summary>各トークンアカウントからいくらの SOL を返金できますか?</summary>
      <p>約 <b>0.00203928 SOL</b> で、これは Solana チェーン上の各トークンアカウント(ATA)の標準レントです。取引したゼロ化コインが多いほど、返金できるレントが増えます。</p>
    </details>
    <details class="faq">
      <summary>ウォレットにどれだけレントがロックされているか確認するには?</summary>
      <p>2 つの方法: ① ウォレットアドレスを TG ボット <a href="https://t.me/solata_rent_bot" target="_blank" rel="noopener">@solata_rent_bot</a> に送ると、数秒でロックされている SOL を返答します; ② <a href="/">solata.top</a> を開いてウォレットを接続して確認。</p>
    </details>
    <details class="faq">
      <summary>価値あるコインを誤って焼却しませんか?</summary>
      <p>保護トークン <b>SOL / USDT / USDC / PYUSD / USDS / EURC</b> は絶対に焼却されません。残高のある他のトークンアカウントは焼却してレントが返金されるため、<b>返金前にウォレット内の価値あるコインを自分で移動</b>し、誤焼却を防いでください。</p>
    </details>
    <details class="faq">
      <summary>ゼロ化・ハニーポットのように残高のある口座も返金できますか?</summary>
      <p><b>はい、これが私たちの強みです。</b>0保有口座は直接閉鎖、ゼロ化・ハニーポットのように残高はあるが売れない口座はトークンを先に焼却してから閉鎖しレントを返金します。市場の大半のツールは <b>空の口座しか返金できず、残高のある口座は返金できません</b> — ゼロ化・ハニーポットコインは売れないため、口座をゼロにできないからです。</p>
    </details>
    <details class="faq">
      <summary>ウォレットに SOL がない場合でも返金できますか?</summary>
      <p>返金にはチェーン上の手数料としてごく少量の SOL(署名あたり約 0.000005 SOL)が必要です。残高が 0 なら少しチャージすれば OK です。</p>
    </details>
    <details class="faq">
      <summary>一部の口座が「返金不可」と表示されるのはなぜ?</summary>
      <p>一部のプロジェクトチームがトークンに <code>closeAuthority</code>(閉鎖権限)を設定すると、その口座はチェーン上で閉鎖できません。closeAuthority がない他の口座はレントを返金できます。</p>
    </details>
    <details class="faq">
      <summary>プラットフォームの手数料はいくらですか?</summary>
      <p>口座あたり <b>0.0002 SOL</b>、レント(0.002 SOL)の約 <b>10%</b> です。返金成功時のみ課金され、<b>0 SOL でも返金できます</b>。</p>
    </details>
    <details class="faq">
      <summary>安全ですか? 秘密鍵を取られますか?</summary>
      <p><b>秘密鍵はウォレットから一切出ません</b>。全工程は「トークンアカウント閉鎖 / レント返金」の署名のみで、SOL や USDT などの資産を送ることはありません。コードは <a href="https://github.com/SOLANAN-ATA/sol-ata-rent-recovery" target="_blank" rel="noopener">GitHub でオープンソース</a>です。</p>
    </details>
    <details class="faq">
      <summary>口座が多い場合はどうなりますか?</summary>
      <p>口座が多い場合は自動で複数のトランザクションに分割され、1 件あたり約 20 口座ずつ、ウォレットで複数回署名を確認する必要があります。</p>
    </details>
    <details class="faq">
      <summary>Pump.fun 取引量デポジット(アキュムレータ)とは?</summary>
      <p><b>pump.fun</b> でミームコインを取引すると、pump.fun がウォレットに自動で「<b>取引量アキュムレータ</b>」口座を作成し、約 <b>0.0018 SOL</b> のデポジットをロックします。一部の口座にはキャッシュバックも溜まります(数 SOL に達することも)。pump.fun プログラム配下で <b>通常のトークンアカウントではないため</b>、大半のツールには見えません。solata.top が見つけ、<b>純額</b>(デポジット + キャッシュバック、<b>10% 手数料差引</b>)を返金します。</p>
    </details>
    <details class="faq">
      <summary>なぜ他のツールはこのデポジットを見つけられないのですか?</summary>
      <p>大半のツールは <b>Token / Token-2022 の 2 つのプログラムのトークンアカウントしかスキャンしない</b>ためです。Pump.fun アキュムレータは pump.fun 自身のプログラム配下にあり、第 2 の隠れた資産です。これが私たちの技術的な堀です — リバースエンジニアリングで対応しました。</p>
    </details>

    <div class="cta">
      <div class="cta-title">まだ疑問が? 直接試してみてください 👇</div>
      <div class="cta-sub">ウォレットを接続すれば、スキャン後の結果が一目瞭然</div>
      <a class="btn" href="/">スキャンして返金を始める</a>
    </div>

    <div class="related">
      <div class="related-title">関連記事</div>
      <a href="/ja/guide.html"><span class="rel-title">📖 Solana レント返金の完全チュートリアル</span><span class="rel-desc">3ステップでロックされた SOL を取り戻す</span></a>
      <a href="/ja/what-is-rent.html"><span class="rel-title">💡 ATA レントとは?</span><span class="rel-desc">Solana トークンアカウントのレントの仕組みを理解</span></a>
    </div>`,
    },
  },

  rent: {
    tr: {
      title: "ATA Kira Nedir? SOL'un Neden Kilitlenir | solata.top",
      desc: "ATA kirası nedir? Solana'da her token hesabı (ATA) yaklaşık 0.002 SOL kira yatırır. Bir de Pump.fun işlem hacmi akümülatör depozitosu (yaklaşık 0.0018 SOL) var — meme coin ticareti yapanlara özgü ikinci tür gizli depozito. Hesabı kapatınca geri alınır.",
      keywords: "ATA kirası nedir, solana kirası, associated token account, solana token hesabı, sol kilitlenmesi, sol kirası geri alma, pump.fun işlem hacmi depozitosu, akümülatör depozitosu",
      ogTitle: "ATA Kira Nedir? SOL'un Neden Kilitlenir | solata.top",
      ogDesc: "Solana'da her token hesabı yaklaşık 0.002 SOL kira yatırır. Ne kadar çok sıfırlanmış coin'e girdiysen, o kadar çok SOL kilitlenir. Mekanizmayı öğren, geri almayı öğren.",
      jsonLd: {
        headline: "ATA Kira Nedir? SOL'un Neden Kilitlenir",
        description: "Solana'da her token hesabı (ATA) yaklaşık 0.002 SOL kira yatırır. Ne kadar çok sıfırlanmış, çöp coin'e girdiysen o kadar çok SOL kilitlenir; hesabı kapatınca geri alınır.",
        inLanguage: "tr",
      },
      body: `
    <div class="breadcrumb"><a href="/">Ana Sayfa</a><span>/</span>Kira Nedir</div>
    <h1>ATA Kira Nedir? SOL'un Neden Kilitlenir</h1>
    <p class="lead">Çoğu kişi bilmez: Solana'da coin alıp meme ticareti yaparken, cüzdanına sessizce bir sürü SOL kirası yatırılır ve bu para — sen hesabı kapatmadıkça — geri alınamaz.</p>

    <h2>Token Hesabı (ATA) Nedir</h2>
    <p>Solana'da cüzdanın (ana hesabın) token'ı doğrudan tutamaz. Her token türü için zincirde bir "İlişkili Token Hesabı" (Associated Token Account, kısaca <b>ATA</b>) oluşturulur, o coin burada saklanır.</p>
    <p>Yani: <b>her farklı coin işlemi = otomatik bir ATA açılması</b>. 100 farklı meme coin'e girdiysen, 100 ATA açılmıştır.</p>

    <h2>Her Hesap Ne Kadar Kira Yatırır</h2>
    <p>Zincirde veri saklamanın depolama maliyeti vardır; Solana hesap suistimalini önlemek için "kira" mekanizması kullanır: her ATA oluşturulurken bir SOL depozitosu yatırılır, şu anda yaklaşık <b>0.00203928 SOL</b>.</p>
    <blockquote>Tek cümle: bir token hesabı açmak ≈ 0.002 SOL yatırmak; kapatmak ≈ 0.002 SOL geri almak.</blockquote>

    <h2>Bu Para Neden "Sıkışır"</h2>
    <p>Normalde token'ı sattığında hesap bakiyesi sıfırlanır ve hesabı kapatıp kirayı geri alabilirsin. Ama sorun şu:</p>
    <ul>
      <li><b>Sıfırlanmış / çöp coin</b>: neredeyse sıfıra düşmüş, satılamaz, hesapta sonsuza dek "katrilyonlarca" çöp coin bakiyesi kalır, kapatılamaz.</li>
      <li><b>Honeypot coin</b>: sadece alınır satılamaz, hesap kilitlidir.</li>
      <li><b>Airdrop coin</b>: proje ekibi habersiz airdrop yapar, sen fark etmezsin, hesap hep açık kalır.</li>
    </ul>
    <p>Bu zombi hesaplar zamanla birikir, her biri 0.002 SOL kilitler. Ne kadar çok meme ticareti yaptıysan, o kadar çok kilitlenir.</p>

    <h2>Bu Para Geri Alınabilir mi?</h2>
    <p>Evet. Hesabı kapatınca kira cüzdanına döner. Mantık: <b>önce çöp coin'i yak (veya boş hesabı doğrudan kapat) → hesabı kapat → kira geri döner</b>.</p>
    <p>Kritik fark: <b>0 bakiyeli hesap</b> doğrudan kapatılıp geri alınabilir; <b>sıfırlanmış ve honeypot</b> gibi bakiyesi olup satılamayan hesaplarda önce token'i <b>yakmak</b> gerekir — bu adımı çoğu araç yapamaz, biz yapabiliriz.</p>
    <p><a href="/">solata.top</a> ile tek tıkla tamamlayabilirsin: önce "Adres Sorgula" ile hesap detayını gör, sonra cüzdanı bağla, zombi hesapları tek tıkla kapat, kirayı geri al. Her hesap yalnızca 0.0002 SOL (kiranın yaklaşık %10'u) komisyon alır.</p>

    <h2>İkinci Tür Gizli Depozito: Pump.fun İşlem Hacmi Akümülatörü</h2>
    <p>Token hesabı kirasının yanı sıra, meme coin ticareti yapanların çoğunun bilmediği bir depozito daha var: <b>pump.fun</b> üzerinde meme coin ticareti yaparken, pump.fun otomatik olarak bir "<b>işlem hacmi akümülatörü</b>" hesabı oluşturur ve yine yaklaşık <b>0.0018 SOL</b> depozito kilitler; bazı hesaplarda cashback de birikir (birkaç SOL'a kadar).</p>
    <p>Bu depozitonun özelliği: pump.fun programına bağlıdır, <b>token hesabı değildir</b>; bu yüzden yalnızca Token/Token-2022 tarayan araçlar onu <b>asla göremez</b>. solata.top özel olarak destekler — tarama sırasında birlikte gösterir, tek tıkla kapatır, depozito + cashback netini (10% komisyon düşülerek) geri verir.</p>
    <blockquote>Tek cümle: cüzdanında iki tür para kilitli olabilir — token hesabı kirası + Pump.fun akümülatör depozitosu; solata ikisini de geri alır.</blockquote>

    <div class="callout warn">
      <div class="callout-title">⚠️ Bir tuzak: closeAuthority</div>
      Az sayıda proje ekibi token'a <code>closeAuthority</code> (kapatma yetkisi) atar; bu hesap zincirde kapatılamaz, kira hep yatırı kalır. Bu yetkisi olmayan diğer hesaplar geri alınabilir.
    </div>

    <div class="cta">
      <div class="cta-title">Cüzdanında ne kadar kilitli? Sorgula 👇</div>
      <div class="cta-sub">Cüzdanı bağla, tüm zombi hesapları otomatik tara</div>
      <a class="btn" href="/">Taramaya Başla</a>
    </div>

    <div class="related">
      <div class="related-title">İlgili Okuma</div>
      <a href="/tr/guide.html"><span class="rel-title">📖 Solana Kira Geri Alma Tam Rehberi</span><span class="rel-desc">3 adımda kilitli SOL'unu geri al</span></a>
      <a href="/tr/faq.html"><span class="rel-title">❓ Kira Geri Alma SSS</span><span class="rel-desc">Ne kadar geri alınır? Yanlışlıkla yakılır mı?</span></a>
    </div>`,
    },
    ko: {
      title: "ATA 렌트란? SOL이 잠기는 이유 | solata.top",
      desc: "ATA 렌트란? Solana에서 각 토큰 계정(ATA)은 약 0.002 SOL의 렌트를 예치합니다. Pump.fun 거래량 누적기 보증금(약 0.0018 SOL)도 있습니다 — 밈 코인 트레이더에게만 있는 제2의 숨은 보증금. 계정을 닫으면 환급됩니다.",
      keywords: "ATA 렌트란, solana 렌트, associated token account, solana 토큰 계정, sol 잠김, sol 렌트 환급, pump.fun 거래량 보증금, 누적기 보증금",
      ogTitle: "ATA 렌트란? SOL이 잠기는 이유 | solata.top",
      ogDesc: "Solana에서 각 토큰 계정은 약 0.002 SOL의 렌트를 예치합니다. 제로화 코인을 많이 거래할수록 잠기는 SOL이 늘어납니다. 메커니즘을 이해하고 되찾는 법을 배우세요.",
      jsonLd: {
        headline: "ATA 렌트란? SOL이 잠기는 이유",
        description: "Solana에서 각 토큰 계정(ATA)은 약 0.002 SOL의 렌트를 예치합니다. 제로화·쓰레기 코인을 많이 거래할수록 잠기는 SOL이 늘어나고, 계정을 닫으면 환급됩니다.",
        inLanguage: "ko",
      },
      body: `
    <div class="breadcrumb"><a href="/">홈</a><span>/</span>렌트란?</div>
    <h1>ATA 렌트란? SOL이 잠기는 이유</h1>
    <p class="lead">많은 분이 모릅니다: Solana에서 코인을 사고 밈을 거래하면, 지갑에 SOL 렌트가 조용히 쌓여 있고, 이 돈은 — 직접 계정을 닫기 전까지 — 되찾을 수 없습니다.</p>

    <h2>토큰 계정(ATA)이란</h2>
    <p>Solana에서 지갑(메인 계정)은 토큰을 직접 보유할 수 없습니다. 각 토큰 종류마다 체인에 '연관 토큰 계정'(Associated Token Account, 약칭 <b>ATA</b>)을 만들어 그 코인을 보관합니다.</p>
    <p>즉: <b>서로 다른 코인을 거래할 때마다 = ATA 하나가 자동 개설</b>됩니다. 서로 다른 밈 코인 100개를 거래했다면 ATA 100개가 열린 셈입니다.</p>

    <h2>계정당 얼마의 렌트가 예치되나요</h2>
    <p>체인에 데이터를 저장하는 데는 저장 비용이 들며, Solana는 계정 남용을 막기 위해 '렌트' 메커니즘을 씁니다: 각 ATA를 만들 때 SOL 보증금을 예치하며, 현재 약 <b>0.00203928 SOL</b>입니다.</p>
    <blockquote>한 줄 요약: 토큰 계정 개설 ≈ 0.002 SOL 예치; 폐쇄 ≈ 0.002 SOL 환급.</blockquote>

    <h2>이 돈이 '묶이는' 이유</h2>
    <p>보통은 토큰을 팔면 계정 잔액이 0이 되어 계정을 닫고 렌트를 되찾을 수 있습니다. 문제는:</p>
    <ul>
      <li><b>제로화 / 쓰레기 코인</b>: 거의 0까지 떨어져 팔리지 않고, 계정에 '수천조'의 쓰레기 코인 잔액이 영원히 남아 닫히지 않습니다.</li>
      <li><b>허니팟 / 꿀단지 코인</b>: 사기만 가능하고 팔 수 없어 계정이 잠깁니다.</li>
      <li><b>에어드랍 코인</b>: 프로젝트 팀이 몰래 에어드랍하면 당신은 모르는 채 계정이 계속 열려 있습니다.</li>
    </ul>
    <p>이 좀비 계정이 쌓일수록 각각 0.002 SOL이 잠깁니다. 밈 거래를 많이 할수록 더 많이 잠깁니다.</p>

    <h2>이 돈을 되찾을 수 있나요?</h2>
    <p>네. 계정을 닫으면 렌트가 지갑으로 돌아옵니다. 원리는: <b>먼저 쓰레기 코인을 소각(또는 빈 계정은 바로 폐쇄) → 계정 폐쇄 → 렌트 환급</b>.</p>
    <p>핵심 차이: <b>0보유 계정</b>은 바로 닫아 환급할 수 있지만, <b>제로화·허니팟</b>처럼 잔액은 있지만 팔 수 없는 계정은 토큰을 먼저 <b>소각</b>해야 닫고 렌트를 환급받을 수 있습니다 — 이 단계를 대부분 도구는 못 하지만 저희는 할 수 있습니다.</p>
    <p><a href="/">solata.top</a>으로 원클릭 완료: 먼저 '주소 조회'로 계정 내역 확인, 지갑 연결, 좀비 계정 원클릭 폐쇄, 렌트 환급. 계정당 0.0002 SOL(렌트의 약 10%) 수수료만 받습니다.</p>

    <h2>제2의 숨은 보증금: Pump.fun 거래량 누적기</h2>
    <p>토큰 계정 렌트 외에도, 밈 코인 트레이더에게는 대부분 모르는 보증금이 하나 더 있습니다: <b>pump.fun</b>에서 밈 코인을 거래하면 pump.fun이 자동으로 '<b>거래량 누적기</b>' 계정을 만들고 역시 약 <b>0.0018 SOL</b> 보증금을 잠급니다. 일부 계정에는 캐시백도 쌓입니다(여러 SOL에 달하기도).</p>
    <p>이 보증금의 특징: pump.fun 프로그램에 속해 <b>토큰 계정이 아니므로</b>, Token/Token-2022만 스캔하는 도구는 <b>영원히 못 봅니다</b>. solata.top이 특별 지원합니다 — 스캔 시 함께 표시하고, 원클릭으로 닫아 보증금 + 캐시백 순액(10% 수수료 차감)을 환급합니다.</p>
    <blockquote>한 줄 요약: 지갑에는 두 종류의 돈이 잠길 수 있습니다 — 토큰 계정 렌트 + Pump.fun 누적기 보증금, solata가 둘 다 환급해 드립니다.</blockquote>

    <div class="callout warn">
      <div class="callout-title">⚠️ 함정 하나: closeAuthority</div>
      소수 프로젝트 팀이 토큰에 <code>closeAuthority</code>(폐쇄 권한)를 설정하면 이 계정은 체인상에서 닫을 수 없어 렌트가 계속 묶입니다. 이 권한이 없는 나머지 계정은 환급할 수 있습니다.
    </div>

    <div class="cta">
      <div class="cta-title">지갑에 얼마나 잠겨 있나요? 조회 👇</div>
      <div class="cta-sub">지갑을 연결하면 모든 좀비 계정을 자동 스캔</div>
      <a class="btn" href="/">스캔 및 환급 시작</a>
    </div>

    <div class="related">
      <div class="related-title">관련 읽기</div>
      <a href="/ko/guide.html"><span class="rel-title">📖 Solana 렌트 환급 전체 튜토리얼</span><span class="rel-desc">3단계로 잠긴 SOL 되찾기</span></a>
      <a href="/ko/faq.html"><span class="rel-title">❓ 렌트 환급 자주 묻는 질문 FAQ</span><span class="rel-desc">얼마나 환급? 실수로 소각?</span></a>
    </div>`,
    },
    ja: {
      title: "ATA レントとは? SOL がロックされる理由 | solata.top",
      desc: "ATA レントとは? Solana では各トークンアカウント(ATA)が約 0.002 SOL のレントを預けます。さらに Pump.fun 取引量アキュムレータのデポジット(約 0.0018 SOL)も — ミームコイン取引者だけにある第 2 の隠れたデポジット。口座を閉じれば返金されます。",
      keywords: "ATA レントとは, solana レント, associated token account, solana トークンアカウント, sol ロック, sol レント回収, pump.fun 取引量デポジット, アキュムレータ デポジット",
      ogTitle: "ATA レントとは? SOL がロックされる理由 | solata.top",
      ogDesc: "Solana では各トークンアカウントが約 0.002 SOL のレントを預けます。ゼロ化コインを多く取引するほどロックされる SOL が増えます。仕組みを理解し、取り戻す方法を学びましょう。",
      jsonLd: {
        headline: "ATA レントとは? SOL がロックされる理由",
        description: "Solana では各トークンアカウント(ATA)が約 0.002 SOL のレントを預けます。ゼロ化・ゴミコインを多く取引するほどロックされる SOL が増え、口座を閉じれば返金されます。",
        inLanguage: "ja",
      },
      body: `
    <div class="breadcrumb"><a href="/">ホーム</a><span>/</span>レントとは</div>
    <h1>ATA レントとは? SOL がロックされる理由</h1>
    <p class="lead">多くの人が知りません: Solana でコインを買いミームを取引すると、ウォレットには SOL レントが静かに積み上がり、このお金は — 自分で口座を閉じるまで — 取り戻せません。</p>

    <h2>トークンアカウント(ATA)とは</h2>
    <p>Solana では、ウォレット(メインアカウント)はトークンを直接保持できません。トークンの種類ごとにチェーン上に「関連トークンアカウント」(Associated Token Account、略称 <b>ATA</b>)が作られ、そのコインがそこに保管されます。</p>
    <p>つまり: <b>異なるコインを取引するたびに = ATA が 1 つ自動開設</b>されます。異なるミームコインを 100 個取引したなら、ATA が 100 個開いたことになります。</p>

    <h2>各口座にいくらのレントが預けられるか</h2>
    <p>チェーン上にデータを保存するにはストレージコストがかかり、Solana は口座の乱用を防ぐため「レント」メカニズムを使います: 各 ATA を作成する際に SOL デポジットを預け、現在は約 <b>0.00203928 SOL</b> です。</p>
    <blockquote>ひとこと: トークンアカウント開設 ≈ 0.002 SOL 預入; 閉鎖 ≈ 0.002 SOL 返金。</blockquote>

    <h2>このお金が「固定される」理由</h2>
    <p>通常はトークンを売ると口座残高がゼロになり、口座を閉じてレントを取り戻せます。問題は:</p>
    <ul>
      <li><b>ゼロ化 / ゴミコイン</b>: ほぼゼロまで下がり売れず、口座には「何千兆」ものゴミコイン残高が永遠に残り、閉じられません。</li>
      <li><b>ハニーポット / 蜜壺コイン</b>: 買うだけで売れず、口座がロックされます。</li>
      <li><b>エアドロップコイン</b>: プロジェクトチームが勝手にエアドロップし、あなたは気づかず口座が開いたままになります。</li>
    </ul>
    <p>これらのゾンビ口座は積み重なり、それぞれ 0.002 SOL をロックします。ミーム取引が多いほど、より多くロックされます。</p>

    <h2>このお金は取り戻せますか?</h2>
    <p>はい。口座を閉じればレントがウォレットに戻ります。考え方は: <b>まずゴミコインを焼却(または空の口座は直接閉鎖) → 口座を閉鎖 → レント返金</b>。</p>
    <p>重要な違い: <b>0保有口座</b>は直接閉じて返金できますが、<b>ゼロ化・ハニーポット</b>のように残高はあるが売れない口座はトークンを先に<b>焼却</b>してから閉じる必要があります — このステップは大半のツールにはできませんが、私たちはできます。</p>
    <p><a href="/">solata.top</a> でワンクリック完了: まず「アドレス照会」で口座内訳を確認し、ウォレットを接続してゾンビ口座をワンクリック閉鎖、レント返金。各口座は 0.0002 SOL(レントの約 10%)の手数料のみです。</p>

    <h2>第 2 の隠れたデポジット: Pump.fun 取引量アキュムレータ</h2>
    <p>トークンアカウントのレントに加えて、ミームコイン取引者にはほとんど知られていないデポジットがもう 1 つあります: <b>pump.fun</b> でミームコインを取引すると、pump.fun が自動で「<b>取引量アキュムレータ</b>」口座を作成し、やはり約 <b>0.0018 SOL</b> のデポジットをロックします。一部の口座にはキャッシュバックも溜まります(数 SOL に達することも)。</p>
    <p>このデポジットの特徴: pump.fun プログラム配下で <b>トークンアカウントではないため</b>、Token/Token-2022 しかスキャンしないツールには <b>永遠に見えません</b>。solata.top が特別対応します — スキャン時に一緒に表示し、ワンクリックで閉じてデポジット + キャッシュバックの純額(10% 手数料差引)を返金します。</p>
    <blockquote>ひとこと: ウォレットには 2 種類のお金がロックされている可能性があります — トークンアカウントのレント + Pump.fun アキュムレータのデポジット。solata が両方取り戻します。</blockquote>

    <div class="callout warn">
      <div class="callout-title">⚠️ 落とし穴: closeAuthority</div>
      少数のプロジェクトチームがトークンに <code>closeAuthority</code>(閉鎖権限)を設定すると、この口座はチェーン上で閉じられず、レントが預けられたままになります。この権限がない他の口座は返金できます。
    </div>

    <div class="cta">
      <div class="cta-title">ウォレットにいくらロックされていますか? 照会 👇</div>
      <div class="cta-sub">ウォレットを接続すれば全ゾンビ口座を自動スキャン</div>
      <a class="btn" href="/">スキャンして返金を始める</a>
    </div>

    <div class="related">
      <div class="related-title">関連記事</div>
      <a href="/ja/guide.html"><span class="rel-title">📖 Solana レント返金の完全チュートリアル</span><span class="rel-desc">3ステップでロックされた SOL を取り戻す</span></a>
      <a href="/ja/faq.html"><span class="rel-title">❓ レント返金のよくある質問 FAQ</span><span class="rel-desc">いくら返金? 誤って焼却?</span></a>
    </div>`,
    },
  },
};

function jsonLdArticle(page, langId, meta) {
  return `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${meta.headline}",
  "description": "${meta.description}",
  "image": "https://solata.top/og-image.png",
  "inLanguage": "${meta.inLanguage}",
  "mainEntityOfPage": "${url(page, langId)}",
  "publisher": {
    "@type": "Organization",
    "name": "solata.top",
    "logo": { "@type": "ImageObject", "url": "https://solata.top/logo.svg" }
  },
  "datePublished": "2026-08-24",
  "dateModified": "2026-09-03"
}`;
}

function jsonLdFaq(entries) {
  const items = entries.map(([q, a]) => `    {
      "@type": "Question",
      "name": "${q}",
      "acceptedAnswer": { "@type": "Answer", "text": "${a}" }
    }`).join(",\n");
  return `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${items}
  ]
}`;
}

function renderPage(page, langId) {
  const m = LANG_META[langId];
  const c = CHROME[langId];
  const data = PAGES[page][langId];
  const ogType = page === "faq" ? "website" : "article";
  const ld = page === "faq" ? jsonLdFaq(data.jsonLd) : jsonLdArticle(page, langId, data.jsonLd);
  const pathPrefix = m.dir ? "/" + m.dir : "";

  return `<!DOCTYPE html>
<html lang="${m.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="canonical" href="${url(page, langId)}">
${hreflang(page, langId)}
<meta name="description" content="${data.desc}">
<meta name="keywords" content="${data.keywords}">
<meta property="og:title" content="${data.ogTitle}">
<meta property="og:description" content="${data.ogDesc}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${url(page, langId)}">
<meta property="og:image" content="https://solata.top/og-image.png">
<link rel="stylesheet" href="/content.css">
<script type="application/ld+json">
${ld}
</script>
</head>
<body>

<header class="site-header">
  <div class="inner">
    <a class="brand" href="/"><img src="/logo.svg" alt="Solata">solata.top</a>
    <nav class="nav">
      <a href="/">${c.nav.home}</a>
      <a href="${pathPrefix}/guide.html"${page === "guide" ? ' class="active"' : ""}>${c.nav.guide}</a>
      <a href="${pathPrefix}/faq.html"${page === "faq" ? ' class="active"' : ""}>${c.nav.faq}</a>
      <a href="${pathPrefix}/what-is-rent.html"${page === "rent" ? ' class="active"' : ""}>${c.nav.rent}</a>
    </nav>
    <nav class="nav lang">
      ${langNav(page, langId)}
    </nav>
  </div>
</header>

<main class="container">
  <article>${data.body}
  </article>
</main>

<footer class="site-footer">
  <div class="links">
    <a href="/">${c.nav.home}</a>
    <a href="${pathPrefix}/guide.html">${c.nav.guide}</a>
    <a href="${pathPrefix}/faq.html">${c.nav.faq}</a>
    <a href="${pathPrefix}/what-is-rent.html">${c.nav.rent}</a>
    <a href="https://t.me/SOLANA_ATA_TEAM" target="_blank" rel="noopener">💬 TG</a>
    <a href="https://x.com/mingzhu038" target="_blank" rel="noopener">𝕏 X.com</a>
  </div>
  <div class="copyright">${c.copyright}</div>
</footer>

</body>
</html>
`;
}

// 生成 tr/ko/ja 三个语言 × 三个页面
for (const langId of ["tr", "ko", "ja"]) {
  for (const page of ["guide", "faq", "rent"]) {
    const filename = page === "rent" ? "what-is-rent.html" : `${page}.html`;
    const dir = path.join(FRONT, langId);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, filename);
    fs.writeFileSync(out, renderPage(page, langId), "utf8");
    console.log("✓", out);
  }
}
