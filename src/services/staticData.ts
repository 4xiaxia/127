
import { Spot, Person, MediaItem, Route } from '../types';
import { getReliableImage } from './geminiService';

// --- RELIABLE PLACEHOLDERS ---
// Using a consistent placeholder service for missing images
const getPlaceholder = (text: string, bg: string = 'e2e8f0', fg: string = '475569') => 
    `https://placehold.co/400x600/${bg}/${fg}.png?text=${encodeURIComponent(text)}`;

export const SPOTS_DATA: Spot[] = [
  // --- 红色文旅 (Red Tourism) ---
  {
    id: "red_001",
    name: "永春辛亥革命纪念馆",
    category: "red",
    subCategory: "纪念馆",
    coord: "118.205240,25.234112",
    intro_short: "缅怀先烈，传承红色基因",
    intro_txt: "【历史回眸】\n永春辛亥革命纪念馆依托东里村郑氏宗祠修建而成。辛亥革命时期，大批旅居海外的永春籍华侨感愤清廷腐败，在孙中山先生的感召下，出资出力，甚至投身革命队伍。\n\n这里不仅是一座建筑，更是一部石刻的史书，记录了郑玉指等先贤“毁家纾难”的爱国壮举。",
    imagePrompt: "Traditional chinese ancestral hall museum red flag",
    imageUrl: "http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/shuyuan.webp-50?e=1763669915&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:rgb5WuVZsu13hdeiQlA9hLwEZtE=",
    tags: ["爱国教育", "郑氏宗祠", "辛亥风云"],
    position: { top: '30%', left: '40%' }
  },
  {
    id: "red_002",
    name: "旌义状石碑",
    category: "red",
    subCategory: "文物",
    coord: "118.204236,25.235664",
    intro_short: "孙中山亲颁，见证华侨爱国情",
    intro_txt: "【文物考证】\n1912年，孙中山先生为表彰郑玉指对革命的巨大贡献，特颁发“旌义状”。\n\n这块石碑立于侨光亭内，碑文苍劲有力。它静静地伫立在村口，向每一位过往的游人诉说着百年前那段波澜壮阔的历史。",
    imagePrompt: "Ancient stone tablet chinese calligraphy close up",
    tags: ["国家一级文物", "孙中山", "华侨之光"],
    position: { top: '35%', left: '45%' }
  },

  // --- 自然/文化 (Nature & Culture) ---
  {
    id: "nature_001",
    name: "油桐花海",
    category: "nature",
    coord: "118.203624,25.237795",
    intro_short: "五月飞雪，浪漫桐花",
    intro_txt: "【生态美景】\n每年暮春初夏，东里水库旁的千亩油桐花竞相绽放。白色的花瓣如雪花般飘落，铺满山间小径。\n\n在这里，你可以放慢脚步，呼吸带着花香的空气，感受“风吹雪”的极致浪漫。",
    imagePrompt: "White tung flowers blooming mountain lake reflection",
    tags: ["打卡圣地", "摄影天堂", "季节限定"],
    position: { top: '60%', left: '20%' }
  },
  {
    id: "culture_001",
    name: "传统婚庆体验馆",
    category: "culture",
    coord: "118.205500,25.234800",
    intro_short: "十里红妆，梦回千年",
    intro_txt: "【民俗非遗】\n依托古厝改造的婚庆体验馆，还原了闽南传统的婚嫁场景。凤冠霞帔、花轿迎亲、跨火盆……\n\n这里保留了最原汁原味的婚俗礼仪，让游客在体验中感受传统文化的庄重与喜庆。",
    imagePrompt: "Chinese traditional wedding room red decorations",
    tags: ["非遗体验", "古厝新生", "婚纱摄影"],
    position: { top: '50%', left: '60%' }
  }
];

export const STATIC_ROUTES: Route[] = [
    {
        id: "route-red",
        name: "红色足迹游",
        category: "历史文化",
        description: "探访辛亥革命遗址，感悟华侨爱国情怀。",
        imagePrompt: "Red tourism route map china village",
        spots: SPOTS_DATA.filter(s => s.category === 'red')
    },
    {
        id: "route-nature",
        name: "生态田园游",
        category: "自然风景",
        description: "漫步油桐花海，体验农耕乐趣。",
        imagePrompt: "Green nature rice field mountains china",
        spots: SPOTS_DATA.filter(s => s.category === 'nature')
    }
];

export const PEOPLE_DATA: Person[] = [
  // --- 烈士 & 乡贤 (Martyrs & Sages) ---
  {
    id: "p_song",
    name: "宋渊源",
    type: "martyr",
    description: "辛亥革命猛将，追随孙中山。",
    detailText: "宋渊源（1881—1961），字子清。早年加入中国同盟会，追随孙中山先生投身辛亥革命。他性格豪爽，作战勇猛，在光复福建的战役中立下赫赫战功。",
    imageUrl: "http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/%E5%AE%8B%E6%B8%8A%E6%BA%90.jpg?e=1763669775&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:4TorkmcfnwZqC0G3v8ZAdG4MCuI="
  },
  {
    id: "p_zheng_yuzhi",
    name: "郑玉指",
    type: "martyr",
    description: "获孙中山亲颁“旌义状”。",
    detailText: "郑玉指（1851—1929年），字绳摇。早年出洋到马来亚经商。1906年加入同盟会。他毁家纾难，慷慨捐输巨资支持革命。1912年，孙中山亲颁“旌义状”表彰。",
    imageUrl: "http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/%E9%83%91%E7%8E%89%E6%8C%87.jpg?e=1763669706&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:nAe770mU7HZ29Qiz1BOj7Uaw1Mg="
  },
  {
    id: "p_li_tiemin",
    name: "李铁民",
    type: "sage",
    description: "被誉为“华侨革命第一笔”。",
    detailText: "李铁民（1898—1956），原名李赋京。著名侨领。以笔为枪，创办报刊，撰写大量文章宣传反清革命思想，一生致力于维护华侨权益。",
    imageUrl: "http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/%E6%9D%8E%E9%93%81%E6%B0%91.jpg?e=1763669601&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:vshvF183VpJxjmV69Qy3ac2wngs="
  },
  {
    id: "p_zheng_chengkuai",
    name: "郑成快",
    type: "martyr",
    description: "辛亥革命功臣，荣获二等奖章。",
    detailText: "郑成快，福建永春东里人。辛亥革命时期积极响应号召，投身革命队伍。在光复福州等战役中表现英勇，荣获辛亥革命二等奖章。",
    imageUrl: "http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/%E9%83%91%E6%88%90%E5%BF%AB.jpg-50?e=1763669651&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:_4fjPmV1QiyEVlScPDO5VjN0yBg="
  },

  // --- 学子 (Students) - Based on Village Records ---
  // 2019
  { id: "stu_2019_1", name: "郑丽君", type: "student", year: 2019, achievement: "录取 泉州华侨大学 (信息工程)", description: "2019届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2019_2", name: "郑洪发", type: "student", year: 2019, achievement: "录取 福建师范大学 (软件工程)", description: "2019届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2019_3", name: "郑坪秀", type: "student", year: 2019, achievement: "录取 厦门医学院 (药学)", description: "2019届 本二录取", detailText: "", imageUrl: "" },
  
  // 2018
  { id: "stu_2018_1", name: "郑灵斯", type: "student", year: 2018, achievement: "录取 南京信息工程大学", description: "2018届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2018_2", name: "郑振星", type: "student", year: 2018, achievement: "录取 集美大学", description: "2018届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2018_3", name: "陈剑鸿", type: "student", year: 2018, achievement: "录取 集美大学", description: "2018届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2018_4", name: "郑素珍", type: "student", year: 2018, achievement: "录取 福建工程学院", description: "2018届 本二录取", detailText: "", imageUrl: "" },
  
  // 2017
  { id: "stu_2017_1", name: "郑慧文", type: "student", year: 2017, achievement: "录取 泉州华侨大学 (经济与金融)", description: "2017届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2017_2", name: "郑珊珊", type: "student", year: 2017, achievement: "录取 厦门华侨大学 (新闻与传播)", description: "2017届 本一录取", detailText: "", imageUrl: "" },
  
  // 2015
  { id: "stu_2015_1", name: "郑集佳", type: "student", year: 2015, achievement: "录取 厦门华侨大学", description: "2015届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2015_2", name: "郑慧鞠", type: "student", year: 2015, achievement: "录取 厦门华侨大学", description: "2015届 本一录取", detailText: "", imageUrl: "" },
  { id: "stu_2015_3", name: "郑佩娜", type: "student", year: 2015, achievement: "录取 湖南师范大学", description: "2015届 本一录取", detailText: "", imageUrl: "" },
  
  // 2007-2014
  { id: "stu_2007_1", name: "郑晓东", type: "student", year: 2007, achievement: "北京中医药大学 (本硕连读)", description: "现任永春县医院中医康复科主任", detailText: "", imageUrl: "" },
  
  // 1999
  { id: "stu_1999_1", name: "郑岩生", type: "student", year: 1999, achievement: "硕士 福州大学计算机系", description: "1999年校友", detailText: "", imageUrl: "" },
  
  // Historical / Unknown Year
  { id: "stu_hist_1", name: "郑霁远", type: "student", year: 1990, achievement: "毕业于 解放军外国语学院", description: "1990年及之前校友", detailText: "", imageUrl: "" },
  { id: "stu_hist_2", name: "郑岩龙", type: "student", year: 1988, achievement: "毕业于 上海交通大学", description: "优秀校友", detailText: "", imageUrl: "" },
  { id: "stu_hist_3", name: "郑胜利", type: "student", year: 1985, achievement: "毕业于 香港城市大学", description: "优秀校友", detailText: "", imageUrl: "" },
  { id: "stu_hist_4", name: "郑福生", type: "student", year: 1980, achievement: "毕业于 厦门大学财政金融系", description: "优秀校友", detailText: "", imageUrl: "" },
  { id: "stu_hist_5", name: "郑振志", type: "student", year: 1978, achievement: "毕业于 厦门大学", description: "优秀校友", detailText: "", imageUrl: "" },
];

export const MEDIA_DATA: MediaItem[] = [
  {
    id: "m_001",
    title: "东里村宣传片：梦里老家",
    type: "video",
    coverUrl: "https://images.unsplash.com/photo-1490623970972-ae8bb3da443e?w=800&q=80",
    url: "#"
  },
  {
    id: "m_002",
    title: "VR全景看东里",
    type: "link",
    coverUrl: "https://images.unsplash.com/photo-1557401616-79c2a8435d87?w=800&q=80",
    url: "#"
  }
];
