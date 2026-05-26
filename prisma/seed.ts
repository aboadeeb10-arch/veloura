/* Veloura — database seed. Re-runnable: clears core tables, then recreates
 * realistic demo data. Translatable text uses { he, ar, ru, en }.
 * Image URLs are placeholders (Unsplash) — replace via the admin panel. */
import {
  PrismaClient,
  Role,
  ClinicCity,
  ServiceCategory,
  ProductCategoryKind,
  MediaType,
  PromoKind,
  PromoScope,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type L4 = { he: string; ar: string; ru: string; en: string };
const L = (he: string, ar: string, ru: string, en: string): L4 => ({
  he,
  ar,
  ru,
  en,
});

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

async function main() {
  console.log("Seeding Veloura…");

  // --- Clear (children first) -------------------------------------------
  await prisma.rewardTransaction.deleteMany();
  await prisma.rewardAccount.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.service.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.practitionerClinic.deleteMany();
  await prisma.workGalleryItem.deleteMany();
  await prisma.story.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.practitioner.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // --- Singletons -------------------------------------------------------
  await prisma.rewardConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // --- Users ------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "aboadeeb10@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Veloura#2026";
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const drJubranUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Dr. Jubran Jbarin",
      phone: "0502777515",
      role: Role.ADMIN,
      emailVerified: new Date(),
      passwordHash: await hash(adminPassword),
    },
  });

  await prisma.user.create({
    data: {
      email: "backup-admin@veloura.local",
      name: "Veloura Backup Admin",
      role: Role.ADMIN,
      emailVerified: new Date(),
      passwordHash: await hash("Veloura#2026"),
    },
  });

  const lingUser = await prisma.user.create({
    data: {
      email: "ling@veloura.local",
      name: "Ling",
      role: Role.EDITOR,
      emailVerified: new Date(),
      passwordHash: await hash("Veloura#2026"),
    },
  });

  const marianUser = await prisma.user.create({
    data: {
      email: "marian@veloura.local",
      name: "Marian Jbarin",
      role: Role.EDITOR,
      emailVerified: new Date(),
      passwordHash: await hash("Veloura#2026"),
    },
  });

  // --- Clinics ----------------------------------------------------------
  const haifa = await prisma.clinic.create({
    data: {
      slug: "haifa",
      city: ClinicCity.HAIFA,
      name: L("חיפה", "حيفا", "Хайфа", "Haifa"),
      address: L(
        "חיפה (כתובת מדויקת תעודכן)",
        "حيفا (سيتم تحديث العنوان الدقيق)",
        "Хайфа (точный адрес уточняется)",
        "Haifa (exact address to be confirmed)",
      ),
      phone: "0502777515",
      hours: {
        sun: "09:00-18:00",
        mon: "09:00-18:00",
        tue: "09:00-18:00",
        wed: "09:00-18:00",
        thu: "09:00-18:00",
        fri: "09:00-13:00",
        sat: "closed",
      },
      photos: [UNSPLASH("1600334129128-685c5582fd35")],
    },
  });

  const ummAlFahem = await prisma.clinic.create({
    data: {
      slug: "umm-al-fahem",
      city: ClinicCity.UMM_AL_FAHEM,
      name: L("אום אל-פחם", "أم الفحم", "Умм-эль-Фахм", "Umm al-Fahem"),
      address: L(
        "אום אל-פחם — שכונת עין ג'ראר",
        "أم الفحم - حي عين جرار",
        "Умм-эль-Фахм — район Эйн-Джарар",
        "Umm al-Fahem — Ein Jarar",
      ),
      phone: "0502777515",
      hours: {
        sun: "10:00-18:00",
        mon: "10:00-18:00",
        tue: "10:00-18:00",
        wed: "10:00-18:00",
        thu: "10:00-18:00",
        fri: "closed",
        sat: "closed",
      },
      photos: [UNSPLASH("1629909613654-28e377c37b09")],
    },
  });

  // --- Practitioners ----------------------------------------------------
  const drJubran = await prisma.practitioner.create({
    data: {
      slug: "dr-jubran-jbarin",
      userId: drJubranUser.id,
      name: "Dr. Jubran Jbarin",
      sortOrder: 1,
      title: L(
        "רופא — רפואה אסתטית",
        "طبيب — طب تجميلي",
        "Врач — эстетическая медицина",
        "Physician — Aesthetic Medicine",
      ),
      bio: L(
        "ד\"ר ג'ובראן גבארין מתמקד בטיפולי בוטוקס למראה פנים צעיר, רענן וטבעי, לצד טיפולי ויטמינים בהזרקה לחיזוק הגוף, שיפור האנרגיה והזנת העור מבפנים. השילוב בין טיפוח חיצוני לחיזוק פנימי הוא המפתח למראה מושלם.",
        "يركّز د. جبران جبارين على علاجات البوتوكس لإطلالة شابة ومنتعشة وطبيعية، إلى جانب علاجات الفيتامينات بالحقن الوريدي التي تقوّي الجسم وتعزّز الطاقة وتغذّي البشرة من الداخل. الجمع بين العناية الخارجية والتقوية الداخلية هو سرّ الإطلالة المثالية.",
        "Доктор Джубран Джбарин специализируется на процедурах ботокса для молодого, свежего и естественного вида лица, а также на инъекционной витаминной терапии, укрепляющей организм, повышающей энергию и питающей кожу изнутри. Сочетание внешнего ухода и внутреннего укрепления — ключ к идеальному облику.",
        "Dr. Jubran Jbarin focuses on Botox treatments for a young, fresh and natural facial appearance, alongside injectable IV vitamin therapy that strengthens the body, boosts energy and nourishes the skin from within. Blending outer care with inner strength is the key to a perfect look.",
      ),
      photos: [UNSPLASH("1612349317150-e413f6a5b16d")],
    },
  });

  const ling = await prisma.practitioner.create({
    data: {
      slug: "ling",
      userId: lingUser.id,
      name: "Ling",
      sortOrder: 2,
      title: L(
        "ארומתרפיסטית ומטפלת קוסמטית",
        "أخصائية علاج عطري وتجميل",
        "Ароматерапевт и косметолог",
        "Aromatherapist & Cosmetic Therapist",
      ),
      bio: L(
        "לינג היא ארומתרפיסטית בעלת 20 שנות ניסיון, עם ידע ומיומנויות שרכשה בבתי ספר מובילים ביפן ובסין. אחד מתחומי ההתמחות שלה הוא יצירת מוצרי טיפוח טבעיים ואיכותיים בעבודת יד, מחומרים טבעיים בלבד. סדרת הטיפולים הקוסמטיים שלה מבוססת על ארומתרפיה — שיטה מסורתית שמקורה במזרח הרחוק. השילוב בין מכשור קוסמטי מתקדם לבין ידע הרפואה הסינית וטכניקות העיסוי מבטיח אפקט עמוק וארוך טווח.",
        "لينغ أخصائية علاج بالروائح العطرية بخبرة 20 عامًا، تدرّبت في مدارس رائدة في اليابان والصين. من مجالات تخصّصها صناعة منتجات عناية طبيعية عالية الجودة يدويًا من مكوّنات طبيعية بحتة. تعتمد سلسلة علاجاتها التجميلية على العلاج العطري — أسلوب تقليدي يعود أصله إلى الشرق الأقصى. والجمع بين أجهزة التجميل المتطوّرة ومعرفة الطب الصيني وتقنيات التدليك يضمن تأثيرًا عميقًا وطويل الأمد.",
        "Линг — ароматерапевт с 20-летним опытом, обучалась в ведущих школах Японии и Китая. Одна из её специализаций — ручное создание качественных натуральных средств по уходу из исключительно натуральных компонентов. Серия её косметических процедур основана на ароматерапии — традиционном методе с Дальнего Востока. Сочетание современной косметологической техники со знанием китайской медицины и техник массажа обеспечивает глубокий и долговременный эффект.",
        "Ling is an aromatherapist with 20 years of experience, trained in leading schools in Japan and China. One of her specialties is hand-crafting high-quality natural skincare products from purely natural ingredients. Her cosmetic treatment series is based on aromatherapy — a traditional method rooted in the Far East. Combining advanced cosmetic technology with Chinese-medicine knowledge and massage techniques ensures a deep, long-lasting effect.",
      ),
      photos: [UNSPLASH("1544161515-4ab6ce6db874")],
    },
  });

  const marian = await prisma.practitioner.create({
    data: {
      slug: "marian-jbarin",
      userId: marianUser.id,
      name: "Marian Jbarin",
      sortOrder: 3,
      title: L(
        "מטפלת קוסמטית והסרת שיער בלייזר",
        "أخصائية تجميل وإزالة شعر بالليزر",
        "Косметолог и специалист по лазерной эпиляции",
        "Cosmetic Therapist & Laser Specialist",
      ),
      bio: L(
        "מריאן גבארין מתמחה בטיפולים קוסמטיים לעור ובהסרת שיער בלייזר בקליניקה באום אל-פחם, ומסייעת ללקוחות להגיע לעור חלק וזוהר בעזרת טכנולוגיה בטוחה ומתקדמת.",
        "تتخصّص ماريان جبارين في علاجات البشرة التجميلية وإزالة الشعر بالليزر في عيادة أم الفحم، وتساعد المراجعات على الحصول على بشرة ناعمة ومشرقة بتقنية آمنة وحديثة.",
        "Мариан Джбарин специализируется на косметических процедурах для кожи и лазерной эпиляции в клинике Умм-эль-Фахм, помогая клиентам добиться гладкой сияющей кожи с помощью безопасных современных технологий.",
        "Marian Jbarin specializes in cosmetic skin treatments and laser hair removal at the Umm al-Fahem clinic, helping clients achieve smooth, radiant skin with safe, modern technology.",
      ),
      photos: [UNSPLASH("1571772996211-2f02c9727629")],
    },
  });

  // --- Practitioner ↔ clinic links (location booking rules) -------------
  await prisma.practitionerClinic.createMany({
    data: [
      { practitionerId: drJubran.id, clinicId: haifa.id },
      { practitionerId: drJubran.id, clinicId: ummAlFahem.id },
      { practitionerId: ling.id, clinicId: haifa.id }, // Ling — Haifa only
      { practitionerId: marian.id, clinicId: ummAlFahem.id }, // Marian — Umm al-Fahem only
    ],
  });

  // --- Working hours (0=Sun … 6=Sat) ------------------------------------
  const wh = (
    practitionerId: string,
    clinicId: string,
    days: number[],
    startTime: string,
    endTime: string,
  ) =>
    days.map((dayOfWeek) => ({
      practitionerId,
      clinicId,
      dayOfWeek,
      startTime,
      endTime,
    }));

  await prisma.workingHours.createMany({
    data: [
      ...wh(drJubran.id, haifa.id, [0, 2, 4], "09:00", "17:00"),
      ...wh(drJubran.id, ummAlFahem.id, [1, 3], "09:00", "17:00"),
      ...wh(ling.id, haifa.id, [0, 1, 2, 3, 4], "10:00", "18:00"),
      ...wh(marian.id, ummAlFahem.id, [0, 1, 2, 3, 4], "10:00", "18:00"),
    ],
  });

  // --- Services ---------------------------------------------------------
  const service = (
    slug: string,
    practitionerId: string,
    category: ServiceCategory,
    name: L4,
    description: L4,
    durationMin: number,
    price: number,
    sortOrder: number,
  ) =>
    prisma.service.create({
      data: {
        slug,
        practitionerId,
        category,
        name,
        description,
        durationMin,
        price,
        sortOrder,
      },
    });

  await service(
    "botox",
    drJubran.id,
    ServiceCategory.AESTHETIC,
    L("בוטוקס", "بوتوكس", "Ботокс", "Botox"),
    L(
      "טיפול בוטוקס לפנים למראה צעיר וטבעי, כולל החלקת קמטים וטיפול בחיוך חניכיים.",
      "علاج البوتوكس للوجه لإطلالة شابة وطبيعية، يشمل تنعيم التجاعيد وعلاج ابتسامة اللثة.",
      "Ботокс для лица для молодого и естественного вида, разглаживание морщин и коррекция «десневой» улыбки.",
      "Facial Botox for a young, natural look — wrinkle smoothing and gummy-smile correction.",
    ),
    30,
    900,
    1,
  );
  await service(
    "dermal-fillers",
    drJubran.id,
    ServiceCategory.AESTHETIC,
    L("מילוי (פילר)", "الفيلر", "Филлеры", "Dermal Fillers"),
    L(
      "מילוי בחומצה היאלורונית לעיצוב והחזרת נפח לפנים.",
      "حقن حمض الهيالورونيك لنحت الوجه واستعادة الحجم.",
      "Гиалуроновые филлеры для контурирования и восстановления объёма лица.",
      "Hyaluronic-acid fillers to contour and restore facial volume.",
    ),
    45,
    1200,
    2,
  );
  await service(
    "pdo-threads",
    drJubran.id,
    ServiceCategory.AESTHETIC,
    L("חוטים (Threads)", "خيوط الشد", "Нити (тредлифтинг)", "PDO Threads"),
    L(
      "מתיחת חוטים להרמת העור וחיזוק קו הלסת.",
      "شد بالخيوط لرفع البشرة وتحديد خط الفك.",
      "Тредлифтинг для подтяжки кожи и укрепления линии челюсти.",
      "Thread lift to lift the skin and define the jawline.",
    ),
    60,
    2000,
    3,
  );
  await service(
    "iv-vitamin-drip",
    drJubran.id,
    ServiceCategory.IV_DRIP,
    L("טיפת ויטמינים (IV)", "تغذية وريدية (IV)", "Витаминные капельницы (IV)", "IV Vitamin Drip"),
    L(
      "עירוי ויטמינים תוך-ורידי לזוהר העור, אנרגיה, חיזוק חיסוני והתאוששות.",
      "تغذية وريدية بالفيتامينات لإشراق البشرة والطاقة وتقوية المناعة والتعافي.",
      "Внутривенные витаминные капельницы для сияния кожи, энергии, иммунитета и восстановления.",
      "Intravenous vitamin infusion for skin glow, energy, immune support and recovery.",
    ),
    45,
    450,
    4,
  );
  await service(
    "fat-dissolving-injections",
    drJubran.id,
    ServiceCategory.AESTHETIC,
    L(
      "המסת שומן בהזרקה",
      "إذابة الدهون بالحقن",
      "Инъекционный липолиз",
      "Fat-Dissolving Injections",
    ),
    L(
      "פתרון יעיל ובטוח להסרת שומן ממוקד ללא ניתוח — לבטן, מותניים וסנטר כפול.",
      "حلّ فعّال وآمن لإزالة الدهون الموضعية دون جراحة — للبطن والخصر والذقن المزدوج.",
      "Эффективное и безопасное удаление локального жира без операции — живот, талия, второй подбородок.",
      "An effective, surgery-free solution for targeted fat removal — belly, waist and double chin.",
    ),
    30,
    700,
    5,
  );

  await service(
    "aromatherapy-massage",
    ling.id,
    ServiceCategory.MASSAGE,
    L("עיסוי ארומתרפי", "تدليك بالروائح العطرية", "Ароматерапевтический массаж", "Aromatherapy Massage"),
    L(
      "עיסוי מרגיע עם שמנים טבעיים בעבודת יד לאיזון הגוף והנפש.",
      "تدليك مريح بزيوت طبيعية مصنوعة يدويًا لتوازن الجسد والروح.",
      "Расслабляющий массаж с натуральными маслами ручной работы для баланса тела и духа.",
      "A relaxing massage with hand-crafted natural oils to balance body and mind.",
    ),
    60,
    320,
    1,
  );
  await service(
    "cosmetic-facial-ling",
    ling.id,
    ServiceCategory.COSMETIC,
    L("טיפול פנים קוסמטי", "علاج وجه تجميلي", "Косметический уход за лицом", "Cosmetic Facial"),
    L(
      "טיפול פנים מבוסס ארומתרפיה עם מכשור מתקדם ומוצרים טבעיים.",
      "علاج وجه قائم على العلاج العطري بأجهزة متطورة ومنتجات طبيعية.",
      "Уход за лицом на основе ароматерапии с современным оборудованием и натуральными средствами.",
      "An aromatherapy-based facial with advanced devices and natural products.",
    ),
    60,
    380,
    2,
  );
  await service(
    "bha-acne-treatment",
    ling.id,
    ServiceCategory.COSMETIC,
    L("טיפול אקנה BHA", "علاج حب الشباب BHA", "BHA-уход против акне", "BHA Acne Treatment"),
    L(
      "טיפול ממוקד לעור עם נטייה לאקנה לניקוי עומק והרגעה.",
      "علاج موجّه للبشرة المعرّضة لحب الشباب لتنظيف عميق وتهدئة.",
      "Целенаправленный уход для кожи, склонной к акне: глубокое очищение и успокоение.",
      "A targeted treatment for acne-prone skin — deep cleansing and soothing.",
    ),
    60,
    400,
    3,
  );
  await service(
    "chinese-treatment",
    ling.id,
    ServiceCategory.CHINESE,
    L("טיפול סיני מסורתי", "علاج صيني تقليدي", "Традиционная китайская процедура", "Traditional Chinese Treatment"),
    L(
      "טיפול בשיטות הרפואה הסינית המסורתית לאיזון אנרגטי ולרווחה.",
      "علاج بأساليب الطب الصيني التقليدي لتوازن الطاقة والعافية.",
      "Процедура по методам традиционной китайской медицины для энергетического баланса и хорошего самочувствия.",
      "A treatment using traditional Chinese-medicine methods for energy balance and wellbeing.",
    ),
    75,
    420,
    4,
  );

  await service(
    "cosmetic-facial-marian",
    marian.id,
    ServiceCategory.COSMETIC,
    L("טיפול פנים קוסמטי", "علاج وجه تجميلي", "Косметический уход за лицом", "Cosmetic Facial Treatment"),
    L(
      "טיפול פנים קוסמטי לניקוי, הזנה וריענון העור.",
      "علاج وجه تجميلي للتنظيف والتغذية وتجديد البشرة.",
      "Косметический уход за лицом: очищение, питание и обновление кожи.",
      "A cosmetic facial for cleansing, nourishing and refreshing the skin.",
    ),
    60,
    350,
    1,
  );
  await service(
    "laser-hair-removal-single",
    marian.id,
    ServiceCategory.LASER,
    L(
      "הסרת שיער בלייזר — טיפול בודד",
      "إزالة الشعر بالليزر — جلسة واحدة",
      "Лазерная эпиляция — одна сессия",
      "Laser Hair Removal — Single Session",
    ),
    L(
      "טיפול לייזר בודד להסרת שיער באזור נבחר.",
      "جلسة ليزر واحدة لإزالة الشعر في منطقة محدّدة.",
      "Одна сессия лазерной эпиляции выбранной зоны.",
      "A single laser session for hair removal on a selected area.",
    ),
    30,
    500,
    2,
  );
  await service(
    "laser-hair-removal-full-body",
    marian.id,
    ServiceCategory.LASER,
    L(
      "הסרת שיער בלייזר — חבילת גוף מלא (10 טיפולים)",
      "إزالة الشعر بالليزر — باقة كامل الجسم (10 جلسات)",
      "Лазерная эпиляция — пакет для всего тела (10 сессий)",
      "Laser Hair Removal — Full Body Package (10 sessions)",
    ),
    L(
      "חבילת 10 טיפולי לייזר להסרת שיער בכל הגוף — מבצע מיוחד.",
      "باقة 10 جلسات ليزر لإزالة شعر كامل الجسم — عرض خاص.",
      "Пакет из 10 лазерных сессий для всего тела — специальное предложение.",
      "A 10-session laser package for full-body hair removal — special offer.",
    ),
    60,
    4000,
    3,
  );

  // --- Product categories ----------------------------------------------
  const faceCat = await prisma.productCategory.create({
    data: {
      kind: ProductCategoryKind.FACE,
      slug: "face",
      name: L("פנים", "الوجه", "Лицо", "Face"),
    },
  });
  const hairCat = await prisma.productCategory.create({
    data: {
      kind: ProductCategoryKind.HAIR,
      slug: "hair",
      name: L("שיער", "الشعر", "Волосы", "Hair"),
    },
  });
  const bodyCat = await prisma.productCategory.create({
    data: {
      kind: ProductCategoryKind.BODY,
      slug: "body",
      name: L("גוף", "الجسم", "Тело", "Body"),
    },
  });

  // --- Products ---------------------------------------------------------
  const product = async (
    slug: string,
    categoryId: string,
    name: L4,
    description: L4,
    regularPrice: number,
    discountedPrice: number,
    image: string,
    isFeatured: boolean,
    variants: { label: L4; stock: number }[],
  ) => {
    const p = await prisma.product.create({
      data: {
        slug,
        categoryId,
        name,
        description,
        regularPrice,
        discountedPrice,
        stock: variants.length ? 0 : 40,
        images: [image],
        isFeatured,
        createdById: drJubranUser.id,
      },
    });
    if (variants.length) {
      await prisma.productVariant.createMany({
        data: variants.map((v, i) => ({
          productId: p.id,
          label: v.label,
          stock: v.stock,
          sortOrder: i,
        })),
      });
    }
    return p;
  };

  await product(
    "natural-glow-face-serum",
    faceCat.id,
    L("סרום זוהר טבעי", "سيروم الإشراق الطبيعي", "Сыворотка «Натуральное сияние»", "Natural Glow Face Serum"),
    L(
      "סרום פנים בעבודת יד מחומרים טבעיים להזנה וזוהר.",
      "سيروم وجه مصنوع يدويًا من مكوّنات طبيعية للتغذية والإشراق.",
      "Сыворотка для лица ручной работы из натуральных компонентов для питания и сияния.",
      "A hand-crafted face serum from natural ingredients for nourishment and glow.",
    ),
    220,
    180,
    UNSPLASH("1620916566398-39f1143ab7be"),
    true,
    [
      { label: L("30 מ\"ל", "30 مل", "30 мл", "30ml"), stock: 25 },
      { label: L("50 מ\"ל", "50 مل", "50 мл", "50ml"), stock: 12 },
    ],
  );
  await product(
    "gentle-cleansing-foam",
    faceCat.id,
    L("קצף ניקוי עדין", "رغوة تنظيف لطيفة", "Нежная очищающая пенка", "Gentle Cleansing Foam"),
    L(
      "קצף ניקוי יומיומי עדין לכל סוגי העור.",
      "رغوة تنظيف يومية لطيفة لجميع أنواع البشرة.",
      "Нежная ежедневная очищающая пенка для всех типов кожи.",
      "A gentle daily cleansing foam for all skin types.",
    ),
    120,
    95,
    UNSPLASH("1556228720-195a672e8a03"),
    true,
    [],
  );
  await product(
    "herbal-hair-oil",
    hairCat.id,
    L("שמן שיער צמחי", "زيت شعر عشبي", "Травяное масло для волос", "Herbal Hair Oil"),
    L(
      "שמן שיער מחומרים צמחיים לחיזוק וברק.",
      "زيت شعر من مكوّنات عشبية للتقوية واللمعان.",
      "Масло для волос из растительных компонентов для укрепления и блеска.",
      "A herbal hair oil for strength and shine.",
    ),
    140,
    110,
    UNSPLASH("1608248543803-ba4f8c70ae0b"),
    true,
    [],
  );
  await product(
    "nourishing-shampoo",
    hairCat.id,
    L("שמפו מזין", "شامبو مغذٍّ", "Питательный шампунь", "Nourishing Shampoo"),
    L(
      "שמפו עדין ומזין לשימוש יומיומי.",
      "شامبو لطيف ومغذٍّ للاستخدام اليومي.",
      "Мягкий питательный шампунь для ежедневного использования.",
      "A gentle, nourishing shampoo for daily use.",
    ),
    90,
    75,
    UNSPLASH("1535585209827-a15fcdbc4c2d"),
    false,
    [],
  );
  await product(
    "aromatherapy-body-oil",
    bodyCat.id,
    L("שמן גוף ארומתרפי", "زيت جسم عطري", "Ароматическое масло для тела", "Aromatherapy Body Oil"),
    L(
      "שמן גוף בעבודת יד עם תמציות טבעיות.",
      "زيت جسم مصنوع يدويًا بخلاصات طبيعية.",
      "Масло для тела ручной работы с натуральными экстрактами.",
      "A hand-crafted body oil with natural extracts.",
    ),
    160,
    130,
    UNSPLASH("1601049541289-9b1b7bbbfe19"),
    true,
    [
      { label: L("לבנדר", "لافندر", "Лаванда", "Lavender"), stock: 18 },
      { label: L("הדרים", "حمضيات", "Цитрус", "Citrus"), stock: 20 },
    ],
  );
  await product(
    "mineral-body-scrub",
    bodyCat.id,
    L("פילינג גוף מינרלי", "مقشّر جسم معدني", "Минеральный скраб для тела", "Mineral Body Scrub"),
    L(
      "פילינג גוף מינרלי לעור חלק ורענן.",
      "مقشّر جسم معدني لبشرة ناعمة ومنتعشة.",
      "Минеральный скраб для тела — гладкая и свежая кожа.",
      "A mineral body scrub for smooth, refreshed skin.",
    ),
    110,
    85,
    UNSPLASH("1612817288484-6f916006741a"),
    false,
    [],
  );

  // --- Hero slides ------------------------------------------------------
  await prisma.heroSlide.createMany({
    data: [
      {
        image: UNSPLASH("1570172619644-dfd03ed5d881"),
        headline: L(
          "יופי טבעי, מטופח במומחיות",
          "جمال طبيعي بعناية الخبراء",
          "Естественная красота под опекой экспертов",
          "Natural beauty, expertly cared for",
        ),
        subtext: L(
          "רפואה אסתטית וטיפוח יופי בחיפה ובאום אל-פחם",
          "طب تجميلي وعناية بالجمال في حيفا وأم الفحم",
          "Эстетическая медицина и уход за красотой в Хайфе и Умм-эль-Фахме",
          "Aesthetic medicine & beauty care in Haifa and Umm al-Fahem",
        ),
        sortOrder: 1,
      },
      {
        image: UNSPLASH("1512290923902-8a9f81dc236c"),
        headline: L(
          "20% הנחה על הטיפול הראשון",
          "خصم 20% على العلاج الأول",
          "Скидка 20% на первую процедуру",
          "20% off your first treatment",
        ),
        subtext: L(
          "הירשמו לאתר וקבלו את ההטבה",
          "سجّلي في الموقع واحصلي على العرض",
          "Зарегистрируйтесь на сайте и получите бонус",
          "Sign up to claim the offer",
        ),
        sortOrder: 2,
      },
      {
        image: UNSPLASH("1487412947147-5cebf100ffc2"),
        headline: L(
          "טיפולי לייזר במבצע מיוחד",
          "علاجات الليزر بعرض خاص",
          "Лазерные процедуры по специальной цене",
          "Laser treatments — special offer",
        ),
        subtext: L(
          "10 טיפולי הסרת שיער לכל הגוף",
          "10 جلسات إزالة شعر لكامل الجسم",
          "10 сессий эпиляции для всего тела",
          "10 full-body hair removal sessions",
        ),
        sortOrder: 3,
      },
    ],
  });

  // --- Stories ----------------------------------------------------------
  await prisma.story.createMany({
    data: [
      {
        mediaUrl: UNSPLASH("1616394584738-fc6e612e71b9"),
        mediaType: MediaType.IMAGE,
        caption: L("בוטוקס", "بوتوكس", "Ботокс", "Botox"),
        sortOrder: 1,
      },
      {
        mediaUrl: UNSPLASH("1598440947619-2c35fc9aa908"),
        mediaType: MediaType.IMAGE,
        caption: L("טיפת ויטמינים", "تغذية وريدية", "Капельницы", "IV Drip"),
        sortOrder: 2,
      },
      {
        mediaUrl: UNSPLASH("1519823551278-64ac92734fb1"),
        mediaType: MediaType.IMAGE,
        caption: L("עיסוי", "تدليك", "Массаж", "Massage"),
        sortOrder: 3,
      },
      {
        mediaUrl: UNSPLASH("1556760544-74068565f05c"),
        mediaType: MediaType.IMAGE,
        caption: L("לייזר", "ليزر", "Лазер", "Laser"),
        sortOrder: 4,
      },
    ],
  });

  // --- Work gallery (before/after) -------------------------------------
  await prisma.workGalleryItem.createMany({
    data: [
      {
        practitionerId: drJubran.id,
        treatmentLabel: L("בוטוקס", "بوتوكس", "Ботокс", "Botox"),
        beforeImage: UNSPLASH("1576091160550-2173dba999ef"),
        afterImage: UNSPLASH("1559599101-f09722fb4948"),
        sortOrder: 1,
      },
      {
        practitionerId: drJubran.id,
        treatmentLabel: L("פילר", "فيلر", "Филлеры", "Filler"),
        singleImage: UNSPLASH("1612349317150-e413f6a5b16d"),
        sortOrder: 2,
      },
      {
        practitionerId: drJubran.id,
        treatmentLabel: L("המסת שומן", "إذابة الدهون", "Липолиз", "Lipolysis"),
        beforeImage: UNSPLASH("1532926381893-7542290edf1d"),
        afterImage: UNSPLASH("1518611012118-696072aa579a"),
        sortOrder: 3,
      },
    ],
  });

  // --- Promo code -------------------------------------------------------
  await prisma.promoCode.create({
    data: {
      code: "WELCOME10",
      kind: PromoKind.PERCENT,
      value: 10,
      scope: PromoScope.PRODUCTS,
      isActive: true,
    },
  });

  console.log("Seed complete.");
  console.log(`  Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("  Editors: ling@veloura.local, marian@veloura.local / Veloura#2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
