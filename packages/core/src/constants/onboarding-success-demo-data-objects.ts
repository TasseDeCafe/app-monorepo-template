import { LangCode, SupportedStudyLanguage } from './lang-codes'

export type OnboardingSuccessDemoDataObjects = {
  text: string
  author: string
  language: SupportedStudyLanguage
}

export const ONBOARDING_SUCCESS_DEMO_DATA_OBJECTS: Record<SupportedStudyLanguage, OnboardingSuccessDemoDataObjects> = {
  [LangCode.ENGLISH]: {
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity...',
    author: 'Charles Dickens, A Tale of Two Cities',
    language: LangCode.ENGLISH,
  },
  [LangCode.SPANISH]: {
    text: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.',
    author: 'Miguel de Cervantes, Don Quixote',
    language: LangCode.SPANISH,
  },
  [LangCode.FRENCH]: {
    text: 'Lorsque j\'avais six ans j\'ai vu, une fois, une magnifique image, dans un livre sur la Forêt Vierge qui s\'appelait "Histoires Vécues". Ça représentait un serpent boa qui avalait un fauve."',
    author: 'Antoine de Saint-Exupéry, The Little Prince',
    language: LangCode.FRENCH,
  },
  [LangCode.GERMAN]: {
    text: 'Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. ',
    author: 'Franz Kafka, The Metamorphosis',
    language: LangCode.GERMAN,
  },
  [LangCode.ITALIAN]: {
    text: 'Tutti i grandi sono stati bambini una volta. Ma pochi di essi se ne ricordano. Le persone grandi non capiscono mai niente da sole e i bambini si stancano a spiegargli tutto ogni volta. ',
    author: 'Antoine de Saint-Exupéry, The Little Prince (Italian translation)',
    language: LangCode.ITALIAN,
  },
  [LangCode.POLISH]: {
    text: 'Był sobie raz chłopiec, który miał na imię Staś Tarkowski, i dziewczynka, którą zwano Nel Rawlison. Oboje urodzili się w dalekim kraju, nad brzegiem Nilu, i pierwsze lata spędzili w mieście Port-Said.',
    author: 'Henryk Sienkiewicz, In Desert and Wilderness',
    language: LangCode.POLISH,
  },
  [LangCode.PORTUGUESE]: {
    text: 'A casa do Pároco nova e caiada, branquejava ao sol, no fim da rua da Misericórdia, entre um quintalejo e um muro anexo ao cemitério.',
    author: 'Eça de Queirós',
    language: LangCode.PORTUGUESE,
  },
  [LangCode.RUSSIAN]: {
    text: 'Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему. Все смешалось в доме Облонских. ',
    author: 'Leo Tolstoy, Anna Karenina',
    language: LangCode.RUSSIAN,
  },
  [LangCode.UKRAINIAN]: {
    text: 'Садок вишневий коло хати, Хрущі над вишнями гудуть, Плугатарі з плугами йдуть, Співають ідучи дівчата, А матері вечерять ждуть. ',
    author: 'Taras Shevchenko',
    language: LangCode.UKRAINIAN,
  },
  [LangCode.CZECH]: {
    text: 'Byl pozdní večer – první máj – večerní máj – byl lásky čas. Hrdliččin zval ku lásce hlas, kde borový zaváněl háj. ',
    author: 'Karel Hynek Mácha, Máj',
    language: LangCode.CZECH,
  },
  [LangCode.DANISH]: {
    text: 'I Danmark er jeg født, der har jeg hjemme, der har jeg rod, derfra min verden går. Du danske sprog, du er min moders stemme, så sødt velsignet du mit hjerte når.',
    author: 'H.C. Andersen, I Danmark er jeg født',
    language: LangCode.DANISH,
  },
  [LangCode.DUTCH]: {
    text: 'Op een mooie zomerochtend reed een net wagentje, bespannen met een vet paard, over de dijkweg van Lekkerkerker. In het wagentje zaten een man en een vrouw. De man was oud, maar de vrouw was oud en rijk. Zij waren getrouwd.',
    author: 'Dutch Prose',
    language: LangCode.DUTCH,
  },
  [LangCode.FINNISH]: {
    text: "Mieleni minun tekevi, aivoni ajattelevi lähteäni laulamahan, saa'ani sanelemahan, sukuvirttä suoltamahan, lajivirttä laulamahan. Sanat suussani sulavat, puhe'et putoelevat, kielelleni kerkiävät, hampahilleni hajoovat.",
    author: 'Elias Lönnrot, Kalevala',
    language: LangCode.FINNISH,
  },
  [LangCode.INDONESIAN]: {
    text: 'Maka pada suatu hari Hang Tuah pun dipanggil oleh Bendahara. Maka sembah Hang Tuah, "Daulat Tuanku, apakah maksud Tuanku memanggil patik?" Maka kata Bendahara, "Hai Tuah, ada pun engkau kupanggil ini, karena aku hendak menyuruh engkau pergi ke Majapahit."',
    author: 'Hikayat Hang Tuah',
    language: LangCode.INDONESIAN,
  },
  [LangCode.MALAY]: {
    text: 'Maka kata Hang Tuah, "Ya Tuanku, patik mohon diampun. Jika sungguh Tuanku hendak mengutus patik ke Majapahit itu, baiklah Tuanku. Patik junjung titah Tuanku."',
    author: 'Hikayat Hang Tuah',
    language: LangCode.MALAY,
  },
  [LangCode.ROMANIAN]: {
    text: 'Cât ține ulița cea mare, casele stau ascunse după gardurile și porțile înalte de scânduri, ca și când s-ar feri să fie văzute din drum.',
    author: 'Romanian Prose',
    language: LangCode.ROMANIAN,
  },
  [LangCode.SLOVAK]: {
    text: 'Nad Tatrou sa blýska, hromy divo bijú. Zastavme ich, bratia, veď sa ony stratia, Slováci ožijú. To Slovensko naše posiaľ tvrdo spalo.',
    author: 'Janko Matúška, Slovak National Anthem',
    language: LangCode.SLOVAK,
  },
  [LangCode.SWEDISH]: {
    text: 'Det var en gång en liten pojke som hette Nils Holgersson. Han var ungefär fjorton år gammal, lång och ranglig och med lingult hår.',
    author: 'Selma Lagerlöf, The Wonderful Adventures of Nils',
    language: LangCode.SWEDISH,
  },
  [LangCode.TURKISH]: {
    text: 'Korkma, sönmez bu şafaklarda yüzen al sancak; Sönmeden yurdumun üstünde tüten en son ocak. O benim milletimin yıldızıdır, parlayacak; O benimdir, o benim milletimindir ancak. Çatma, kurban olayım, çehreni ey nazlı hilal!',
    author: 'Mehmet Akif Ersoy, Turkish National Anthem',
    language: LangCode.TURKISH,
  },
  [LangCode.HUNGARIAN]: {
    text: 'A patakban két gyermek fürdik: egy fiú meg egy leány. Nem illik tán, hogy együtt fürödnek, de ők ezt nem tudják: a fiú alig hétesztendős, a leány két évvel fiatalabb.',
    author: 'Géza Gárdonyi, Egri csillagok',
    language: LangCode.HUNGARIAN,
  },
  [LangCode.NORWEGIAN]: {
    text: 'Det var en gang en fattig husmann som bodde langt inne i en skog. Han hadde mange barn og lite å gi dem, både av mat og klær, men alle var de glade og fornøyde likevel. ',
    author: 'Norwegian Folktale',
    language: LangCode.NORWEGIAN,
  },
}
