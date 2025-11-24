import { LangCode } from './lang-codes'

export const MIN_LENGTH_OF_AUDIO_FOR_CLONING_IN_SECONDS = 20

export const LANG_TO_TEXT_FOR_CLONING: Record<LangCode, string> = {
  [LangCode.ENGLISH]:
    'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.',
  [LangCode.SPANISH]:
    'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo. Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas.',
  [LangCode.GERMAN]:
    'Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. Er lag auf seinem panzerartig harten Rücken und sah, wenn er den Kopf ein wenig hob, seinen gewölbten, braunen, von bogenförmigen Versteifungen geteilten Bauch, auf dessen Höhe sich die Bettdecke, zum gänzlichen Niedergleiten bereit, kaum noch erhalten konnte. ',
  [LangCode.FRENCH]:
    'Lorsque j\'avais six ans j\'ai vu, une fois, une magnifique image, dans un livre sur la Forêt Vierge qui s\'appelait "Histoires Vécues". Ça représentait un serpent boa qui avalait un fauve. Voilà la copie du dessin. On disait dans le livre : "Les serpents boas avalent leur proie tout entière, sans la mâcher. Ensuite ils ne peuvent plus bouger et ils dorment pendant les six mois de leur digestion.',
  [LangCode.ITALIAN]:
    'Tutti i grandi sono stati bambini una volta. Ma pochi di essi se ne ricordano. Le persone grandi non capiscono mai niente da sole e i bambini si stancano a spiegargli tutto ogni volta. I bambini devono essere indulgenti con i grandi. Noi, naturalmente, noi che conosciamo la vita, noi ridiamo degli indovinelli scritti.',
  [LangCode.POLISH]:
    'Był sobie raz chłopiec, który miał na imię Staś Tarkowski, i dziewczynka, którą zwano Nel Rawlison. Oboje urodzili się w dalekim kraju, nad brzegiem Nilu, i pierwsze lata spędzili w mieście Port-Said. Staś był synem polskiego inżyniera pracującego przy kanale Sueskim, a Nel córką jednego z dyrektorów Kompanii Kanału.',
  [LangCode.CZECH]:
    'Byl pozdní večer – první máj – večerní máj – byl lásky čas. Hrdliččin zval ku lásce hlas, kde borový zaváněl háj. O lásce šeptal tichý mech; květoucí strom lhal lásky žel, svou lásku slavík růži pěl, růžinu jevil vonný vzdech.',
  [LangCode.UKRAINIAN]:
    "Садок вишневий коло хати, Хрущі над вишнями гудуть, Плугатарі з плугами йдуть, Співають ідучи дівчата, А матері вечерять ждуть. Сім'я вечеря коло хати, Вечірня зіронька встає. Дочка вечерять подає, А мати хоче научати, Так соловейко не дає.",
  [LangCode.RUSSIAN]:
    'Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему. Все смешалось в доме Облонских. Жена узнала, что муж был в связи с бывшею в их доме француженкою-гувернанткой, и объявила мужу, что не может жить с ним в одном доме. Положение это продолжалось уже третий день и мучительно чувствовалось и самими супругами, и всеми членами семьи, и домочадцами.',
  [LangCode.PORTUGUESE]:
    'A casa do Pároco nova e caiada, branquejava ao sol, no fim da rua da Misericórdia, entre um quintalejo e um muro anexo ao cemitério. O Pároco era um homem sanguíneo e nutrido, que passava entre o povo por viver numas ocasiões duma maneira e noutras doutra. A sua hospedeira, cujo nome era Ana Gança, era uma mulher muito no ar dos quarenta.',
  [LangCode.VIETNAMESE]:
    'Trăm năm trong cõi người ta, Chữ tài chữ mệnh khéo là ghét nhau. Trải qua một cuộc bể dâu, Những điều trông thấy mà đau đớn lòng. Lạ gì bỉ sắc tư phong, Trời xanh quen thói má hồng đánh ghen.',
  [LangCode.CHINESE]:
    '曹操酒醉赤壁前，关公战关羽华容。诸葛亮借东风，周郎妙计安天下。满堂花醉三千客，一剑霜寒十四州。临江仙壮怀激烈，雄姿英发美少年。江山如此多娇，引无数英雄竞折腰。惜秦皇汉武，略输文采；唐宗宋祖，稍逊风骚。一代天骄，成吉思汗，只识弯弓射大雕。俱往矣，数风流人物，还看今朝。',
  [LangCode.HINDI]:
    'मदिरालय जाने को घर से चलता है पीनेवाला, किस पथ से जाऊँ? असमंजस में है वह भोलाभाला, अलग-अलग पथ बतलाते सब पर मैं यह बतलाता हूँ - राह पकड़ तू एक चला चल, पा जाएगा मधुशाला। बाधा अनेक डाल देती है जग में दिखती हाला, किन्तु बढ़ा करता है उनको पीनेवाला भोलाभाला, है वहीं एक जो मधु के घट से टकरा कर गिरता है, फिर वह उठता और चलता है, पा जाता मधुशाला।',
  [LangCode.INDONESIAN]:
    'Maka pada suatu hari Hang Tuah pun dipanggil oleh Bendahara. Maka sembah Hang Tuah, "Daulat Tuanku, apakah maksud Tuanku memanggil patik?" Maka kata Bendahara, "Hai Tuah, ada pun engkau kupanggil ini, karena aku hendak menyuruh engkau pergi ke Majapahit."',
  [LangCode.MALAY]:
    'Maka kata Hang Tuah, "Ya Tuanku, patik mohon diampun. Jika sungguh Tuanku hendak mengutus patik ke Majapahit itu, baiklah Tuanku. Patik junjung titah Tuanku." Maka kata Bendahara, "Baiklah, engkau bersiap-siaplah. Adapun perahumu itu sudah hadir."',
  [LangCode.JAPANESE]:
    '月日は百代の過客にして、行かふ年も又旅人也。舟の上に生涯をうかべ、馬の口とらえて老いを迎ふる物は、日々旅にして、旅を栖とす。古人も多く旅に死せるあり。',
  [LangCode.KOREAN]:
    '나 보기가 역겨워 가실 때에는 말없이 고이 보내 드리오리다. 영변에 약산 진달래꽃 아름 따다 가실 길에 뿌리오리다. 가시는 걸음 걸음 놓인 그 꽃을 사뿐히 즈려 밟고 가시옵소서. 나 보기가 역겨워 가실 때에는 죽어도 아니 눈물 흘리오리다.',
  [LangCode.TAMIL]:
    'யாதும் ஊரே யாவரும் கேளிர் தீதும் நன்றும் பிறர்தர வாரா நோதலும் தணிதலும் அவற்றோ ரன்ன சாதலும் புதுவது அன்றே வாழ்தல் இனிதென மகிழ்ந்தன்றும் இலமே முனிவின் இன்னாது என்றலும் இலமே. கற்றதனால் ஆய பயனென்கொல் வாலறிவன் நற்றாள் தொழாஅர் எனின். மலர்மிசை ஏகினான் மாணடி சேர்ந்தார் நிலமிசை நீடுவாழ் வார். யானை புக்க புலம் போல் தாமும் உடன்புக்கு தாம்பிறர்க்கு உதவுவர் கற்றறிந்தோர்.',
  [LangCode.TURKISH]:
    'Korkma, sönmez bu şafaklarda yüzen al sancak; Sönmeden yurdumun üstünde tüten en son ocak. O benim milletimin yıldızıdır, parlayacak; O benimdir, o benim milletimindir ancak. Çatma, kurban olayım, çehreni ey nazlı hilal!',
  [LangCode.ROMANIAN]:
    'Cât ține ulița cea mare, casele stau ascunse după gardurile și porțile înalte de scânduri, ca și când s-ar feri să fie văzute din drum. Doar ici-colo câte-o fereastră cu perdelele albe, curate, strălucește voioasă în lumina soarelui de primăvară. ',
  [LangCode.SWEDISH]:
    'Det var en gång en liten pojke som hette Nils Holgersson. Han var ungefär fjorton år gammal, lång och ranglig och med lingult hår. Inte mycket dugde han till: han tyckte mest om att äta och sova, och det enda han hade lust med var att ställa till odygd. En söndag morgon skulle föräldrarna gå till kyrkan.',
  [LangCode.NORWEGIAN]:
    'Det var en gang en fattig husmann som bodde langt inne i en skog. Han hadde mange barn og lite å gi dem, både av mat og klær, men alle var de glade og fornøyde likevel. Det var en søndag midt på sommeren at husbonden sa til kona si: "Nå synes jeg vi skal ta oss en tur ut i skogen og plukke litt bær til barna våre."',
  [LangCode.DANISH]:
    'I Danmark er jeg født, der har jeg hjemme, der har jeg rod, derfra min verden går. Du danske sprog, du er min moders stemme, så sødt velsignet du mit hjerte når. Du danske, friske strand, hvor oldtids kæmpegrave stå mellem æblegård og humlehave.',
  [LangCode.SLOVAK]:
    'Nad Tatrou sa blýska, hromy divo bijú. Zastavme ich, bratia, veď sa ony stratia, Slováci ožijú. To Slovensko naše posiaľ tvrdo spalo. Ale blesky hromu vzbudzujú ho k tomu, aby sa prebralo.',
  [LangCode.DUTCH]:
    'Op een mooie zomerochtend reed een net wagentje, bespannen met een vet paard, over de dijkweg van Lekkerkerker. In het wagentje zaten een man en een vrouw. De man was oud, maar de vrouw was oud en rijk. Zij waren getrouwd.',
  [LangCode.THAI]:
    'แม่น้ำโขงใสสะอาด ไหลผ่านลานทรายขาว สู่ทุ่งนาข้าวเขียวขจี ดอกไม้สวยบานริมทาง นกน้อยร้องเพลงเพราะพริ้ง ธรรมชาติงดงามเหลือเกิน ใครได้มาเยือนต้องหลงรัก ฟ้าสวยใสไร้เมฆา ลมพัดโบกสะบัดใบไม้ ไผ่เรียงรายริมทาง เสียงน้ำไหลเย็นชื่นใจ ชาวบ้านยิ้มต้อนรับ อาหารอร่อยถูกปาก ผ้าทอมือสวยตา วัฒนธรรมน่าหลงใหล ใครมาเยือนไม่อยากจากไป',
  [LangCode.HUNGARIAN]:
    'Hazádnak rendületlenül légy híve, ó magyar; Bölcsőd az s majdan sírod is, Mely ápol s eltakar. A nagy világon e kívül Nincsen számodra hely; Áldjon vagy verjen sors keze: Itt élned, halnod kell.',
  [LangCode.GREEK]:
    "Σε γνωρίζω από την κόψη του σπαθιού την τρομερή, σε γνωρίζω από την όψη που με βία μετράει τη γη. Απ' τα κόκαλα βγαλμένη των Ελλήνων τα ιερά, και σαν πρώτα ανδρειωμένη, χαίρε, ω χαίρε, Ελευθεριά!",
  [LangCode.FINNISH]:
    "Mieleni minun tekevi, aivoni ajattelevi lähteäni laulamahan, saa'ani sanelemahan, sukuvirttä suoltamahan, lajivirttä laulamahan. Sanat suussani sulavat, puhe'et putoelevat, kielelleni kerkiävät, hampahilleni hajoovat.",
  [LangCode.BULGARIAN]:
    'Една майска вечер цялото село Бяла черква беше се изсипало на улицата. Пред кафенето на Ганковица бяха насядали на пейките първенците. Те пушеха с чибуците и разговаряха тихо. Разговорът им се въртеше все около онова тайнствено писмо, което бяха получили преди два дена и което обещаваше, че скоро ще дойде при тях човек от Букурещ, за да им даде важни наставления.',
  [LangCode.CATALAN]:
    "Pàtria de misèria i servitud, de vells costums i nova rebellia, la meva gent ha conquistat la vida, i amb la vida, l'amor i la llibertat. Terra d'homes, terra d'esperança, país que avança a cavall del progrés, la meva gent ha vençut la nit fosca, i l'alba encén el foc d'un nou dia.",
}
