'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
type Page = 'home' | 'reading' | 'mongol' | 'chat' | 'calendar' | 'numerology' | 'pricing' | 'account'
type Service = 'daily' | 'natal' | 'love' | 'yearly'
type Tradition = 'western' | 'vedic'
type Lang = 'mn' | 'en'

interface User { name: string; bdate: string | null }
interface CalEvents { [date: string]: string[] }
interface ChatMessage { role: 'user' | 'ai'; text: string }

// ── Constants ──────────────────────────────────────────────────────────────
const NOW = new Date('2026-05-03T12:00:00')
const TODAY_STR = '2026-05-03'

const SIGNS_MN = ['Хуц','Үхэр','Ихэр','Мэлхий','Арслан','Охин','Жинлүүр','Хилэнц','Нум','Матар','Хувин','Загас']
const SIGNS_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']
const SIGN_COLORS = ['#E85D40','#8B7355','#F5D56E','#7EB8C9','#E8A020','#6B9E6B','#C9A96E','#8B3A3A','#9B59B6','#5B8A8B','#4A90D9','#7B68EE']
const SIGN_RANGES = [
  {m1:3,d1:21,m2:4,d2:19},{m1:4,d1:20,m2:5,d2:20},{m1:5,d1:21,m2:6,d2:20},{m1:6,d1:21,m2:7,d2:22},
  {m1:7,d1:23,m2:8,d2:22},{m1:8,d1:23,m2:9,d2:22},{m1:9,d1:23,m2:10,d2:22},{m1:10,d1:23,m2:11,d2:21},
  {m1:11,d1:22,m2:12,d2:21},{m1:12,d1:22,m2:1,d2:19},{m1:1,d1:20,m2:2,d2:18},{m1:2,d1:19,m2:3,d2:20}
]
const M_ANIMALS_MN = ['Хулгана','Үхэр','Бар','Туулай','Луу','Могой','Морь','Хонь','Бич','Тахиа','Нохой','Гахай']
const M_EMOJI = ['🐭','🐂','🐯','🐰','🐉','🐍','🐴','🐑','🐒','🐓','🐕','🐗']
const M_ELEMENTS = ['Мод','Гал','Газар','Төмөр','Ус']
const MENGE_DATA = [
  {num:1,name:'Нэгэн мэнгэ',desc:'Хаан мэнгэ — манлайлагч, хүч чадалтай, амбицтай',c:'#C9A96E'},
  {num:2,name:'Хоёр мэнгэ',desc:'Нар мэнгэ — гэрэлт, дулаан зантай, нийгэмч',c:'#7EB8C9'},
  {num:3,name:'Гурван мэнгэ',desc:'Бар мэнгэ — зоригтой, шийдэмгий, идэвхтэй',c:'#E85D40'},
  {num:4,name:'Дөрвөн мэнгэ',desc:'Луу мэнгэ — авъяаслаг, ухаалаг, уран бүтээлч',c:'#9B59B6'},
  {num:5,name:'Таван мэнгэ',desc:'Газар мэнгэ — тогтвортой, найдвартай, тэвчээртэй',c:'#6B9E6B'},
  {num:6,name:'Зургаан мэнгэ',desc:'Морь мэнгэ — чөлөөт, хурдан, нийгэмд дуртай',c:'#E8A020'},
  {num:7,name:'Долоон мэнгэ',desc:'Хонь мэнгэ — нинжин, уран, тайван байдалтай',c:'#4A90D9'},
  {num:8,name:'Найман мэнгэ',desc:'Бич мэнгэ — ухаалаг, зохион байгуулагч, ялалтанд чиглэдэг',c:'#F5D56E'},
  {num:9,name:'Есөн мэнгэ',desc:'Тахиа мэнгэ — нарийн, хариуцлагатай, анхааралтай',c:'#C0614A'},
]
const ANIMAL_INFO: Record<string, {e:string;t:string}> = {
  'хулгана':{e:'🐭',t:'Хулгана жилийн хүмүүс ухаалаг, шуурхай, дасан зохицох чадвартай. 1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020 онд мэндэлсэн.'},
  'үхэр':{e:'🐂',t:'Үхэр жилийн хүмүүс тэвчээртэй, хичээнгүй, найдвартай. 1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021 онд мэндэлсэн.'},
  'бар':{e:'🐯',t:'Бар жилийн хүмүүс зоригтой, идэвхтэй, шийдэмгий. 1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022 онд мэндэлсэн.'},
  'туулай':{e:'🐰',t:'Туулай жилийн хүмүүс нинжин, тайван, уран чадвартай. 1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023 онд мэндэлсэн.'},
  'луу':{e:'🐉',t:'Луу жилийн хүмүүс хүчирхэг, авъяаслаг, манлайлагч. 1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024 онд мэндэлсэн.'},
  'могой':{e:'🐍',t:'Могой жилийн хүмүүс гүн бодолтой, нууцлаг, зальтай. 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025 онд мэндэлсэн.'},
  'морь':{e:'🐴',t:'Морь жилийн хүмүүс чөлөөт, хурдан, нийгэмд дуртай. 1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026 онд мэндэлсэн.'},
  'хонь':{e:'🐑',t:'Хонь жилийн хүмүүс нинжин, уран, тайван зантай. 1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027 онд мэндэлсэн.'},
  'бич':{e:'🐒',t:'Бич жилийн хүмүүс ухаалаг, тоглоомч, олон талт. 1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028 онд мэндэлсэн.'},
  'тахиа':{e:'🐓',t:'Тахиа жилийн хүмүүс хариуцлагатай, нарийн, тодорхой. 1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029 онд мэндэлсэн.'},
  'нохой':{e:'🐕',t:'Нохой жилийн хүмүүс үнэнч, шударга, хамгаалагч. 1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030 онд мэндэлсэн.'},
  'гахай':{e:'🐗',t:'Гахай жилийн хүмүүс сэтгэлтэй, хишиг буянтай, тунгалаг. 1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031 онд мэндэлсэн.'},
}
const NUM_MEANINGS: Record<number, {name:string;desc:string}> = {
  1:{name:'Манлайлагч',desc:'Та бие даасан, зоригтой, шинийг санаачлагч. Өөрийн замаа өөрөө засдаг хүн.'},
  2:{name:'Зуучлагч',desc:'Та нинжин сэтгэлтэй, хамтын ажиллагааг дэмждэг, харилцааг чухалчилдаг хүн.'},
  3:{name:'Бүтээлч',desc:'Та уран бүтээлч, илэрхийлэл сайтай, тоглоомч. Урлаг, хөгжим, нийгэмд авъяастай.'},
  4:{name:'Барилгачин',desc:'Та тогтвортой, хичээнгүй, найдвартай. Системтэй ажиллаж, бат суурь тавихыг хүсдэг.'},
  5:{name:'Эрх чөлөөч',desc:'Та тэнүүл, адал явдалт, солих дуртай. Хувьсалыг хайрладаг, эрх чөлөө чухал.'},
  6:{name:'Тэжээгч',desc:'Та хариуцлагатай, бусдыг халамжлагч. Гэр бүл, нийгэмд үүрэг хүлээхийг хайрладаг.'},
  7:{name:'Мэргэн ухаантан',desc:'Та гүн бодогч, нарийн шинжлэгч. Дотоод ертөнцдөө баялаг, судалгаанд авъяастай.'},
  8:{name:'Зарлигт',desc:'Та эрх мэдэл, бизнест амжилтанд хүрдэг. Удирдах чадвар, санхүүд хүч чадалтай.'},
  9:{name:'Хүмүүнлэгч',desc:'Та нийгэмд хувь нэмэр оруулахыг хүсдэг. Бусдад сайн сэтгэлтэй хүн.'},
  11:{name:'Мэргэн санаач',desc:'Гайхамшигт тоо 11. Та зөн билгийн хурц, бусдад урам зориг өгч, идеал болдог.'},
  22:{name:'Агуу барилгачин',desc:'Гайхамшигт тоо 22. Та дэлхийд хийх агуу ажлын боломжтой.'},
  33:{name:'Агуу тэжээгч',desc:'Гайхамшигт тоо 33. Та бусдын зовлонг харж, тусалдаг нийгмийн агуу халамжлагч.'},
}
const LUCKY_DAYS = [3,6,9,12,15,18,21,24,27,30]
const MONTHS_MN = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS_MN = ['Да','Мя','Лх','Пү','Ба','Бя','Ня']
const DAYS_EN = ['Mo','Tu','We','Th','Fr','Sa','Su']
const LOAD_MN = ['Одны байрлалыг тооцоолж байна...','Гаригуудын нөлөөг шинжилж байна...','AI зурхай бэлтгэж байна...','Таны хувь тавиланг уншиж байна...','Тэнгэрийн замналыг нээж байна...']
const LOAD_EN = ['Calculating star positions...','Analyzing planetary influences...','Preparing your AI reading...','Reading your destiny...','Opening the celestial path...']

// ── Helpers ────────────────────────────────────────────────────────────────
function getSignIdx(ds: string): number {
  if (!ds) return 4
  const d = new Date(ds), m = d.getMonth()+1, day = d.getDate()
  for (let i = 0; i < 12; i++) {
    const r = SIGN_RANGES[i]
    if (r.m1 <= r.m2) { if ((m===r.m1&&day>=r.d1)||(m===r.m2&&day<=r.d2)||(m>r.m1&&m<r.m2)) return i }
    else { if ((m===r.m1&&day>=r.d1)||(m===r.m2&&day<=r.d2)||m>r.m1||m<r.m2) return i }
  }
  return 11
}
function animalIdx(yr: number) { return ((yr-4)%12+12)%12 }
function elementIdx(yr: number) { return Math.floor(((yr-4)%10+10)%10/2) }
function mengeCalc(yr: number, mo: number, dy: number) { const b = ((yr%9)+(mo%9)+(dy%9))%9; return b===0?9:b }
function letterVal(c: string) {
  const v: Record<string,number> = {a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8}
  return v[c.toLowerCase()]||0
}
function reduceNum(n: number): number {
  while (n > 9 && n!==11 && n!==22 && n!==33) { n = String(n).split('').reduce((a,b) => a+parseInt(b), 0) }
  return n
}
function parseRaw(raw: string) {
  const clean = raw.replace(/\*+/g,'').trim()
  const parts = clean.split(/###/).filter(Boolean)
  const secs = parts[0]&&parts[0].trim().length<40 ? parts.slice(1) : parts
  return secs.map(s => {
    const lines = s.trim().split('\n').filter(l=>l.trim())
    return { title: lines[0].trim(), body: lines.slice(1).map(l=>l.trim()).filter(Boolean) }
  })
}

async function callClaude(prompt: string, system?: string, maxTokens = 1100) {
  const body: Record<string,unknown> = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  }
  if (system) body.system = system
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const d = await r.json()
  return (d.content?.[0]?.text || '') as string
}

// ── Stars Canvas Hook ──────────────────────────────────────────────────────
function useStars(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let stars: {x:number;y:number;r:number;a:number;s:number;p:number}[] = []
    let W = 0, H = 0, animId = 0, t = 0
    const cvs = canvas

    function resize() {
      W = cvs.width = window.innerWidth
      H = cvs.height = window.innerHeight
    }
    function init() {
      stars = []
      const n = Math.floor(W*H/5200)
      for (let i=0;i<n;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.2,a:Math.random()*0.7+0.1,s:Math.random()*0.3+0.05,p:Math.random()*Math.PI*2})
    }
    function draw() {
      ctx.clearRect(0,0,W,H); t+=0.008
      for (const s of stars) { const a=s.a*(0.6+0.4*Math.sin(t*s.s+s.p)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill() }
      animId = requestAnimationFrame(draw)
    }
    resize(); init(); draw()
    window.addEventListener('resize', () => { resize(); init() })
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', () => {}) }
  }, [canvasRef])
}

// ── Natal Chart SVG ────────────────────────────────────────────────────────
function NatalChart({ signIdx }: { signIdx: number }) {
  const pl = ['☉','☽','♂','♀','♃','♄','☿'], an = [0,42,88,134,180,226,280]
  const cx=160, cy=160, r=118
  return (
    <svg width="320" height="320" viewBox="0 0 320 320" className="chart-svg">
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(201,169,110,0.05)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#cg)" stroke="rgba(201,169,110,0.15)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={r*.68} fill="none" stroke="rgba(201,169,110,0.07)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={r*.34} fill="none" stroke="rgba(201,169,110,0.07)" strokeWidth="1"/>
      {Array.from({length:12},(_,i)=>{
        const a=(i*30-90)*Math.PI/180
        const idx=(i+signIdx)%12
        return (
          <g key={i}>
            <line x1={cx+r*.34*Math.cos(a)} y1={cy+r*.34*Math.sin(a)} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(201,169,110,0.09)" strokeWidth="0.5"/>
            <text x={cx+r*1.12*Math.cos(a)} y={cy+r*1.12*Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fill={SIGN_COLORS[idx]} fontSize="12" opacity="0.85">{SIGN_SYMBOLS[idx]}</text>
          </g>
        )
      })}
      {pl.map((p,i)=>{
        const a=(an[i]-90)*Math.PI/180, rr=r*(0.44+(i%3)*0.12)
        const x=cx+rr*Math.cos(a), y=cy+rr*Math.sin(a)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="12" fill="rgba(10,10,18,0.85)" stroke="rgba(201,169,110,0.28)" strokeWidth="1"/>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={SIGN_COLORS[(i*3+signIdx)%12]} fontSize="11">{p}</text>
          </g>
        )
      })}
      <text x={cx} y={cy-7} textAnchor="middle" fill="rgba(201,169,110,0.7)" fontSize="14" fontFamily="Cormorant Garamond,serif">{SIGN_SYMBOLS[signIdx]}</text>
      <text x={cx} y={cy+9} textAnchor="middle" fill="rgba(201,169,110,0.4)" fontSize="9">{SIGNS_MN[signIdx]}</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function TengriHoroscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useStars(canvasRef)

  // ── State ──
  const [page, setPage] = useState<Page>('home')
  const [lang, setLang] = useState<Lang>('mn')
  const [service, setService] = useState<Service>('daily')
  const [tradition, setTradition] = useState<Tradition>('western')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModal, setAuthModal] = useState(false)
  const [cardModal, setCardModal] = useState(false)
  const [authTab, setAuthTab] = useState<'login'|'register'>('login')
  const [user, setUser] = useState<User|null>(null)
  const [toast, setToast] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const [countdown, setCountdown] = useState('23:59:59')

  // Reading
  const [fName, setFName] = useState('')
  const [fDate, setFDate] = useState('')
  const [fTime, setFTime] = useState('')
  const [fCity, setFCity] = useState('')
  const [fPName, setFPName] = useState('')
  const [fPDate, setFPDate] = useState('')
  const [reading, setReading] = useState<{name:string;sign:string;sym:string;si:number;sections:{title:string;body:string[]}[];compat?:{sign1:string;sign2:string;pct:number};mongol?:{animal:string;element:string}}|null>(null)
  const [readLoading, setReadLoading] = useState(false)
  const [readLoadText, setReadLoadText] = useState('')

  // Auth form
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regBdate, setRegBdate] = useState('')

  // Card
  const [cardNum, setCardNum] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Chat
  const [chatHistory, setChatHistory] = useState<{role:'user'|'assistant';content:string}[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{role:'ai',text:'mn'}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Mongol
  const [mdByear, setMdByear] = useState('')
  const [mdGender, setMdGender] = useState('male')
  const [mdLoading, setMdLoading] = useState(false)
  const [mdSections, setMdSections] = useState<{title:string;body:string[]}[]>([])
  const [mdLucky, setMdLucky] = useState<{color:string;num:string;time:string}|null>(null)
  const [mcBdate, setMcBdate] = useState('')
  const [mcGender, setMcGender] = useState('male')
  const [mcResult, setMcResult] = useState<{animal:string;element:string;menge:number;mengeName:string;mengeDesc:string;year2026:string;zasal:boolean}|null>(null)
  const [selectedAnimal, setSelectedAnimal] = useState<string|null>(null)

  // Calendar
  const [calYear, setCalYear] = useState(NOW.getFullYear())
  const [calMonth, setCalMonth] = useState(NOW.getMonth())
  const [calEvents, setCalEvents] = useState<CalEvents>({})
  const [evDate, setEvDate] = useState(TODAY_STR)
  const [evText, setEvText] = useState('')

  // Numerology
  const [numName, setNumName] = useState('')
  const [numDate, setNumDate] = useState('')
  const [numResult, setNumResult] = useState<{n:number;label:string;highlight?:boolean}[]|null>(null)
  const [numAiText, setNumAiText] = useState('')
  const [numLoading, setNumLoading] = useState(false)

  // History
  const [history, setHistory] = useState<{icon:string;title:string;date:string;badge:string}[]>([{icon:'☀',title:'Өдрийн зурхай',date:'2026.05.03',badge:'Арслан'}])

  // ── Countdown ──
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date(), end = new Date(now); end.setHours(23,59,59,999)
      const d = end.getTime()-now.getTime()
      const h = String(Math.floor(d/3600000)).padStart(2,'0')
      const m = String(Math.floor(d%3600000/60000)).padStart(2,'0')
      const s = String(Math.floor(d%60000/1000)).padStart(2,'0')
      setCountdown(`${h}:${m}:${s}`)
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Toast ──
  const showToast = useCallback((msg: string) => {
    setToast(msg); setToastShow(true)
    setTimeout(() => setToastShow(false), 3200)
  }, [])

  // ── Language helpers ──
  const t = useCallback((mn: string, en: string) => lang==='mn' ? mn : en, [lang])
  const gSign = useCallback((i: number) => lang==='mn' ? SIGNS_MN[i] : SIGNS_EN[i], [lang])

  // ── Chat scroll ──
  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:'smooth'}) }, [chatMessages])

  // ── Auto-fill from profile ──
  useEffect(() => {
    if (user?.bdate) {
      if (!fDate) setFDate(user.bdate)
      if (!mcBdate) setMcBdate(user.bdate)
      if (!numDate) setNumDate(user.bdate)
      const yr = new Date(user.bdate).getFullYear()
      setMdByear(String(yr))
    }
  }, [user])

  // ── Auth ──
  function doLogin() {
    if (!authEmail || !authPass) { showToast(t('И-мэйл болон нууц үгээ оруулна уу','Enter email and password')); return }
    loginUser(authEmail.split('@')[0], null)
  }
  function doRegister() {
    if (!regName||!regEmail||!regPass) { showToast(t('Бүх талбарыг бөглөнө үү','Fill all fields')); return }
    if (!regBdate) { showToast(t('Төрсөн огноогоо оруулна уу','Enter your birth date')); return }
    loginUser(regName, regBdate)
  }
  function loginUser(name: string, bdate: string|null) {
    setUser({name, bdate})
    setAuthModal(false)
    showToast(`${t('Тавтай морилно уу, ','Welcome, ')}${name}! ✦`)
  }
  function submitCard() {
    if (cardNum.replace(/\s/g,'').length < 16) { showToast(t('Картын дугаар буруу байна','Invalid card number')); return }
    setCardModal(false)
    showToast(t('✦ Амжилттай! Эхний сар үнэгүй эхэллээ.','✦ Success! Your free month has started.'))
  }

  // ── Generate Reading ──
  async function generateReading() {
    const name = fName || t('Та','You')
    const date = fDate || user?.bdate || ''
    if (!date) { showToast(t('Төрсөн огноогоо оруулна уу','Enter your birth date')); return }
    const si = getSignIdx(date), sign = gSign(si), sym = SIGN_SYMBOLS[si]
    setReading(null); setReadLoading(true)
    const texts = lang==='mn' ? LOAD_MN : LOAD_EN
    let li = 0; setReadLoadText(texts[0])
    const lv = setInterval(() => setReadLoadText(texts[li++%texts.length]), 1500)
    const td = `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()).padStart(2,'0')}`
    const tl = tradition==='vedic' ? t('Ведик астрологийн аргаар','Using Vedic astrology') : t('Барууны астрологийн аргаар','Using Western astrology')
    const wl = lang==='mn' ? 'Монгол хэлээр бич.' : 'Write in English.'
    const ns = lang==='mn' ? '* тэмдэг хэрэглэхгүй. Мөр бүр тусдаа параграф болгож бич.' : 'No * symbols. Each sentence on its own line.'
    const prompts: Record<Service,string> = {
      daily:`${wl} Та мэргэжлийн астрологич. ${tl}. Өнөөдрийн огноо: ${td}. ${name} нэртэй, ${sign} (${sym}) тэмдгийн хүний өнөөдрийн зурхайг бэлтгэ. Хэсэг бүрийг ### тэмдэгээр эхлүүл:\n### Ерөнхий эрч хүч\n### Харилцаа ба хайр\n### Карьер ба мөнгө\n### Анхааруулга\n${ns} 170-210 үг.`,
      natal:`${wl} Та мэргэжлийн астрологич. ${tl}. ${name}, ${date}${fTime?' цаг '+fTime:''}, ${fCity||'Улаанбаатар'}-д мэндэлсэн. ${sign} (${sym}) тэмдгийн natal chart. ### тэмдэгээр хэсэг хуваа:\n### Нарны байрлал ба зан чанар\n### Гаригуудын нөлөө\n### Хайр ба харилцаа\n### Карьер ба боломж\n### Ирээдүйн зам\n${ns} 240-280 үг.`,
      love:`${wl} Та хайр дурлалын астрологич. ${tl}. ${name} (${sign}, ${date}) болон ${fPName||'Хамтрагч'} (${gSign(getSignIdx(fPDate))}, ${fPDate||'?'}) хоёрын нийцлийг шинжил. ### тэмдэгээр:\n### Нийцлийн түвшин (заавал хувь оруул)\n### Хүчтэй тал\n### Сорилт\n### Зөвлөгөө\n${ns} 200-240 үг.`,
      yearly:`${wl} Та мэргэжлийн астрологич. ${tl}. Одоогийн он: ${NOW.getFullYear()}, өнөөдөр: ${td}. ${name}, ${sign} (${sym}) тэмдгийн хүний ${NOW.getFullYear()} оноос ${NOW.getFullYear()+1} он хүртэлх жилийн урьдчилсан мэдээ. ### тэмдэгээр:\n### Ерөнхий чиглэл\n### Карьер ба мөнгө\n### Хайр ба гэр бүл\n### Эрүүл мэнд\n### Хамгийн сайн үе\n### Болгоомжлол\n${ns} 260-300 үг.`
    }
    try {
      const raw = await callClaude(prompts[service])
      clearInterval(lv); setReadLoading(false)
      const sections = parseRaw(raw)
      const yr = new Date(date).getFullYear()
      const compat = service==='love' && fPDate ? {
        sign1: sign, sign2: gSign(getSignIdx(fPDate)),
        pct: 60 + Math.abs((si-getSignIdx(fPDate))*7%35)
      } : undefined
      const mongol = { animal: M_EMOJI[animalIdx(yr)]+' '+M_ANIMALS_MN[animalIdx(yr)], element: M_ELEMENTS[elementIdx(yr)] }
      setReading({name, sign, sym, si, sections, compat, mongol})
      if (user) setHistory(h => [{icon:{daily:'☀',natal:'✦',love:'♡',yearly:'◈'}[service],title:service,date:NOW.toLocaleDateString('mn-MN'),badge:sign},...h])
    } catch {
      clearInterval(lv); setReadLoading(false)
      showToast(t('Алдаа гарлаа. Дахин оролдоно уу.','Error. Please try again.'))
    }
  }

  // ── Mongol Daily ──
  async function generateMongolDaily() {
    const yr = parseInt(mdByear)
    if (!yr||yr<1900||yr>2025) { showToast(t('Төрсөн оноо оруулна уу','Enter birth year')); return }
    const ai = animalIdx(yr), el = elementIdx(yr)
    const todayAi = animalIdx(NOW.getFullYear())
    const dl = `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,'0')}-${String(NOW.getDate()).padStart(2,'0')}`
    setMdLoading(true); setMdSections([]); setMdLucky(null)
    const p = `Та мэргэжлийн Монгол зурхайч юм. Өнөөдрийн огноо: ${dl} (${NOW.getFullYear()} оны Морины жил, ${M_ANIMALS_MN[todayAi]} өдөр).\n${yr} онд мэндэлсэн, ${M_ANIMALS_MN[ai]} жилийн ${M_ELEMENTS[el]} элементийн ${mdGender==='male'?'эрэгтэй':'эмэгтэй'} хүний ӨНӨӨДРИЙН монгол зурхайг бэлтгэ.\nМонгол хэлээр. Дараах 5 хэсэгт хуваа, хэсэг бүрийг ### тэмдэгээр эхлүүл:\n### Өдрийн ерөнхий байдал\n### Хайр ба харилцаа\n### Карьер ба мөнгө\n### Эрүүл мэнд\n### Анхааруулга ба зөвлөгөө\nАЗ ЗАВШААН:\nLUCKY_COLOR: [нэр]\nLUCKY_NUMBER: [тоо]\nLUCKY_TIME: [цагийн нэр]\n* тэмдэг хэрэглэхгүй. Хүн шиг дулаан бич.`
    try {
      const raw = (await callClaude(p)).replace(/\*+/g,'').trim()
      const color = (raw.match(/LUCKY_COLOR:\s*(.+)/)||[])[1]?.trim()||'—'
      const num = (raw.match(/LUCKY_NUMBER:\s*(.+)/)||[])[1]?.trim()||'—'
      const time = (raw.match(/LUCKY_TIME:\s*(.+)/)||[])[1]?.trim()||'—'
      setMdLucky({color, num, time})
      const clean = raw.replace(/LUCKY_(COLOR|NUMBER|TIME):.+/g,'').trim()
      setMdSections(parseRaw(clean))
    } catch { showToast(t('Алдаа гарлаа','Error. Try again.')) }
    finally { setMdLoading(false) }
  }

  // ── Calc Mongol ──
  function calcMongol() {
    if (!mcBdate) { showToast(t('Төрсөн огноогоо оруулна уу','Enter birth date')); return }
    const d = new Date(mcBdate), yr = d.getFullYear(), mo = d.getMonth()+1, dy = d.getDate()
    const ai = animalIdx(yr), el = elementIdx(yr)
    const menge = mengeCalc(yr, mo, dy), mi = MENGE_DATA[menge-1]
    const good = ['морь','хулгана','луу','тахиа']
    setMcResult({
      animal: M_EMOJI[ai]+' '+M_ANIMALS_MN[ai]+' ('+yr+')',
      element: M_ELEMENTS[el]+' элемент',
      menge, mengeName: mi.name, mengeDesc: mi.desc,
      year2026: good.includes(M_ANIMALS_MN[ai].toLowerCase()) ? '🌟 Маш азтай жил' : menge%3===0 ? '⚠ Болгоомжтой байх хэрэгтэй' : '✦ Эерэг боломжтой жил',
      zasal: menge===4||menge===7
    })
  }

  // ── Calendar ──
  function buildCalendar() {
    const fd = new Date(calYear, calMonth, 1)
    let sw = (fd.getDay()+6)%7
    const dim = new Date(calYear, calMonth+1, 0).getDate()
    const pd = new Date(calYear, calMonth, 0).getDate()
    const cells = []
    for (let i=0;i<sw;i++) cells.push({day:pd-sw+1+i,cur:false,isT:false,isL:false,key:'',evs:[]})
    for (let d=1;d<=dim;d++) {
      const isT = calYear===NOW.getFullYear()&&calMonth===NOW.getMonth()&&d===NOW.getDate()
      const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      cells.push({day:d,cur:true,isT,isL:LUCKY_DAYS.includes(d),key,evs:calEvents[key]||[]})
    }
    const rem = (7-(sw+dim)%7)%7
    for (let i=1;i<=rem;i++) cells.push({day:i,cur:false,isT:false,isL:false,key:'',evs:[]})
    return cells
  }
  function addCalEvent() {
    if (!evDate||!evText.trim()) { showToast(t('Огноо болон тэмдэглэлээ оруулна уу','Enter date and note')); return }
    setCalEvents(prev => ({...prev,[evDate]:[...(prev[evDate]||[]),evText.trim()]}))
    setEvText(''); showToast(t('✓ Нэмэгдлээ','✓ Added'))
  }
  function delCalEvent(date: string, idx: number) {
    setCalEvents(prev => {
      const evs = [...(prev[date]||[])]; evs.splice(idx,1)
      if (!evs.length) { const n={...prev}; delete n[date]; return n }
      return {...prev,[date]:evs}
    })
  }

  // ── Numerology ──
  async function calcNumerology() {
    if (!numName||!numDate) { showToast(t('Нэр болон огноогоо оруулна уу','Enter name and date')); return }
    const dp = numDate.split('-')
    const lp = reduceNum(dp.join('').split('').reduce((a,b)=>a+parseInt(b),0))
    const vowels = 'aeiou'
    const nameClean = numName.toLowerCase().replace(/[^a-z]/g,'')
    const exp = reduceNum(nameClean.split('').reduce((a,c)=>a+letterVal(c),0))
    const soul = reduceNum(nameClean.split('').filter(c=>vowels.includes(c)).reduce((a,c)=>a+letterVal(c),0)||1)
    const pers = reduceNum(nameClean.split('').filter(c=>!vowels.includes(c)).reduce((a,c)=>a+letterVal(c),0)||1)
    const bday = reduceNum(parseInt(dp[2]))
    const py = reduceNum(parseInt(dp[1])+parseInt(dp[2])+NOW.getFullYear())
    setNumResult([
      {n:lp,label:t('Амьдралын зам','Life Path'),highlight:true},
      {n:exp,label:t('Илэрхийлэл','Expression')},
      {n:soul,label:t('Сэтгэлийн хүсэл','Soul Urge')},
      {n:pers,label:t('Гадаад дүр','Personality')},
      {n:bday,label:t('Мэндэлсэн өдрийн тоо','Birth Day')},
      {n:py,label:`${NOW.getFullYear()} ${t('оны хувийн тоо','Personal Year')}`},
    ])
    setNumLoading(true); setNumAiText('')
    const pr = lang==='mn'
      ? `Та тоон зурхайн мэргэжилтэн. ${numName}, ${numDate}-д мэндэлсэн. Амьдралын зам: ${lp}, Илэрхийлэл: ${exp}, Сэтгэлийн хүсэл: ${soul}, ${NOW.getFullYear()} оны хувийн тоо: ${py}. Монгол хэлээр, дулаан, дэлгэрэнгүй, * тэмдэггүй. Мөр бүр тусдаа. 150-200 үг.`
      : `Numerology expert. Interpret for ${numName}, born ${numDate}. Life Path: ${lp}, Expression: ${exp}, Soul Urge: ${soul}, ${NOW.getFullYear()} Personal Year: ${py}. English, warm, no * symbols, each sentence on new line, 150-200 words.`
    try {
      const raw = (await callClaude(pr, undefined, 600)).replace(/\*+/g,'').trim()
      setNumAiText(raw)
    } catch { setNumAiText(t('AI тайлбар ачаалахад алдаа гарлаа.','Failed to load AI interpretation.')) }
    finally { setNumLoading(false) }
  }

  // ── Chat ──
  async function sendChat(msg?: string) {
    const text = msg ?? chatInput.trim()
    if (!text) return
    setChatInput('')
    setChatMessages(prev => [...prev, {role:'user',text}])
    const newHistory = [...chatHistory, {role:'user' as const, content:text}]
    setChatHistory(newHistory)
    setChatLoading(true)
    const ui = user ? t(`Хэрэглэгч: нэр=${user.name}, төрсөн огноо=${user.bdate||'мэдэгдээгүй'}.`,`User: name=${user.name}, birth=${user.bdate||'unknown'}.`) : ''
    const sys = lang==='mn'
      ? `Та Tengri Horoscope-ийн AI зурхайн зөвлөгч. Монгол хэлээр хариулна. ${ui} Барууны болон Монгол астрологийн мэдлэгтэй. Хайр, карьер, хувь заяа, нийцэл зэрэг сэдвээр ДЭЛГЭРЭНГҮЙ, ХҮНЛЭГ, дулаан зөвлөгөө өг. Одоогийн он бол 2026. Ирээдүйн таамагт 2026, 2027, 2028 зэрэг он хэлж болно. * тэмдэг хэрэглэхгүй. Мөр бүр дараа мөрнөөс эхлэх. 160-250 үг.`
      : `You are Tengri Horoscope's AI astrology advisor. Reply in English. ${ui} Expert in Western and Mongolian astrology. Give DETAILED, WARM, human-like advice. Current year is 2026. Use 2026-2028 for predictions. No * symbols. Each thought on its own line. 160-250 words.`
    try {
      const raw = (await callClaude(text, sys)).replace(/\*+/g,'').trim()
      const updatedHistory = [...newHistory, {role:'assistant' as const, content:raw}]
      setChatHistory(updatedHistory)
      setChatMessages(prev => [...prev, {role:'ai',text:raw}])
    } catch {
      setChatMessages(prev => [...prev, {role:'ai',text:t('Алдаа гарлаа. Интернет холболтоо шалгана уу.','Error. Check your internet connection.')}])
    }
    setChatLoading(false)
  }

  const todayAnimalIdx = animalIdx(NOW.getFullYear())
  const calCells = buildCalendar()
  const allEvents = Object.entries(calEvents).sort().flatMap(([date,evs])=>evs.map(ev=>({date,ev})))

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <>
      <canvas id="star-canvas" ref={canvasRef}/>

      {/* MOBILE NAV */}
      <div className={`mobile-nav ${mobileOpen?'open':''}`}>
        <button className="mobile-close" onClick={()=>setMobileOpen(false)}>✕</button>
        {(['home','reading','mongol','chat','calendar','numerology','pricing'] as Page[]).map(p=>(
          <button key={p} className="mobile-nav-link" onClick={()=>{setPage(p);setMobileOpen(false)}}>
            {t({home:'Нүүр',reading:'Зурхай',mongol:'Монгол',chat:'AI Зөвлөгч',calendar:'Календар',numerology:'Тоон зурхай',pricing:'Үнэ',account:'Миний'}[p] as string,
               {home:'Home',reading:'Horoscope',mongol:'Mongolian',chat:'AI Guide',calendar:'Calendar',numerology:'Numerology',pricing:'Pricing',account:'My'}[p] as string)}
          </button>
        ))}
      </div>

      {/* NAV */}
      <nav>
        <div className="logo" onClick={()=>setPage('home')}>᠁ TENGRI</div>
        <div className="nav-links">
          {(['home','reading','mongol','chat','calendar','numerology','pricing'] as Page[]).map(p=>(
            <button key={p} className={`nav-link ${page===p?'active':''}`} onClick={()=>setPage(p)}>
              {t({home:'Нүүр',reading:'Зурхай',mongol:'Монгол уламжлал',chat:'AI Зөвлөгч',calendar:'Календар',numerology:'Тоон зурхай',pricing:'Үнэ',account:'Миний'}[p] as string,
                 {home:'Home',reading:'Horoscope',mongol:'Mongolian',chat:'AI Guide',calendar:'Calendar',numerology:'Numerology',pricing:'Pricing',account:'My'}[p] as string)}
            </button>
          ))}
          {user && <button className={`nav-link ${page==='account'?'active':''}`} onClick={()=>setPage('account')}>{t('Миний','My')}</button>}
        </div>
        <div className="nav-right">
          <button className="lang-btn" onClick={()=>setLang(l=>l==='mn'?'en':'mn')}>{lang==='mn'?'EN':'МН'}</button>
          <button className="nav-cta" onClick={()=>user?setPage('account'):setAuthModal(true)}>
            {user ? user.name.slice(0,8) : t('Нэвтрэх','Sign In')}
          </button>
          <button className="hamburger" onClick={()=>setMobileOpen(true)}><span/><span/><span/></button>
        </div>
      </nav>

      {/* ── HOME ── */}
      <div className={`page ${page==='home'?'active':''}`}>
        <div className="hero">
          <div className="hero-orb hero-orb-1"/>
          <div className="hero-orb hero-orb-2"/>
          <div className="hero-rings"><div className="hero-ring"/><div className="hero-ring"/><div className="hero-ring"/></div>
          <div className="hero-badge"><span className="hero-badge-dot"/>{t('AI · Барууны · Ведик · Монгол','AI · Western · Vedic · Mongolian')}</div>
          <h1><em>{t('Тэнгэрийн нууцыг','Unlock the secrets')}</em><span className="line2">{t('тайлж өгнө','of the heavens')}</span></h1>
          <p className="hero-sub">{t('Tengri Horoscope — Монгол уламжлалт зурхай, Барууны астрологи болон Ведик тооцоог AI-р нэгтгэсэн Монголын анхны платформ.','Tengri Horoscope — Mongolia\'s first platform combining Mongolian tradition, Western and Vedic astrology with AI.')}</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={()=>setPage('reading')}>✦ {t('Зурхай авах','Get Reading')}</button>
            <button className="btn-secondary" onClick={()=>setPage('mongol')}>{t('Монгол уламжлал →','Mongolian Tradition →')}</button>
          </div>
          <div className="hero-stats">
            <div><div className="stat-num">12</div><div className="stat-label">{t('Орд тэмдэг','Zodiac Signs')}</div></div>
            <div><div className="stat-num">12</div><div className="stat-label">{t('Жилийн амьтан','Animal Signs')}</div></div>
            <div><div className="stat-num">9</div><div className="stat-label">{t('Мэнгэ','Menge')}</div></div>
          </div>
        </div>
        <div className="services-section">
          <div className="section-header">
            <p className="section-eyebrow">{t('Үйлчилгээ','Services')}</p>
            <h2 className="section-title">{t('Бүх төрлийн зурхай нэг газарт','All readings in one place')}</h2>
          </div>
          <div className="services-grid">
            {[
              {icon:'☀',title:t('Өдрийн зурхай','Daily Horoscope'),desc:t('Хайр, мөнгө, эрүүл мэнд, ажил — өдөр бүр AI-р бэлтгэсэн хувийн зурхай.','Love, money, health, work — personalized AI daily reading.'),price:t('Үнэгүй','Free'),svc:'daily'},
              {icon:'✦',title:'Natal Chart',desc:t('Мэндэлсэн цагийн гаригуудын байрлалаас таны зан чанар, хувь заяаны дэлгэрэнгүй шинжилгээ.','Deep analysis of personality and destiny from planetary positions at birth.'),price:'₮9,900',svc:'natal'},
              {icon:'♡',title:t('Хайрын нийцэл','Love Compatibility'),desc:t('Хоёр хүний одны нийцэл, харилцааны зөвлөгөө, хайр дурлалын таамаглал.','Cosmic compatibility, relationship advice, and love forecast.'),price:'₮7,900',svc:'love'},
              {icon:'◈',title:t('Жилийн мэдээ','Yearly Forecast'),desc:t('Тухайн жилийн карьер, хайр, эрүүл мэнд, мөнгөний нарийн урьдчилсан мэдээ.','Detailed yearly predictions for career, love, health, finances.'),price:'₮14,900',svc:'yearly'},
            ].map(s=>(
              <div key={s.svc} className="svc-card" onClick={()=>{setPage('reading');setService(s.svc as Service)}}>
                <div className="svc-icon-wrap">{s.icon}</div>
                <div className="svc-title">{s.title}</div>
                <div className="svc-desc">{s.desc}</div>
                <div className="svc-price">{s.price}</div>
              </div>
            ))}
            <div className="svc-card mongol-card" onClick={()=>setPage('mongol')}>
              <div className="svc-badge">{t('Монгол онцлог','Mongolian')}</div>
              <div className="svc-icon-wrap">🐉</div>
              <div className="svc-title">{t('Жил & Мэнгэ','Animal & Menge')}</div>
              <div className="svc-desc">{t('Монгол уламжлалт 12 жилийн амьтан, 9 мэнгэ, засал болон өдөр тутмын зурхай.','Traditional 12 animals, 9 menge, zasal and daily readings.')}</div>
              <div className="svc-price" style={{color:'var(--red)'}}>{t('Үнэгүй','Free')}</div>
            </div>
            <div className="svc-card" onClick={()=>setPage('chat')}>
              <div className="svc-icon-wrap">◎</div>
              <div className="svc-title">{t('AI Зөвлөгч','AI Advisor')}</div>
              <div className="svc-desc">{t('Астрологийн чат зөвлөгч — хэдийд ч асуугаарай. Хайр, карьер, хувь заяа.','Astrology chat advisor — ask anything, anytime.')}</div>
              <div className="svc-price">₮19,900 / {t('сар','mo')}</div>
            </div>
          </div>
        </div>
        <div className="mongol-strip">
          <div className="mongol-strip-inner">
            <div className="mongol-strip-icon">🇲🇳</div>
            <div className="mongol-strip-content">
              <h3>{t('Монгол уламжлалт зурхай','Traditional Mongolian Astrology')}</h3>
              <p>{t('Билгийн тоолол, жил мэнгэний засал, сайн муу өдрийн тооцоо — зөвхөн Tengri-д.','Bilgiin toolol, zasal, lucky days — only on Tengri.')}</p>
              <div className="mongol-tags">
                {['Билгийн тоолол','Мэнгэ тооцоо','Засал','Жилийн амьтан'].map(tag=><span key={tag} className="mongol-tag">{tag}</span>)}
              </div>
            </div>
            <div className="mongol-strip-cta">
              <button className="btn-mongol" onClick={()=>setPage('mongol')}>{t('Судлах →','Explore →')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── READING ── */}
      <div className={`page ${page==='reading'?'active':''}`}>
        <div className="reading-wrap">
          <div className="page-heading">
            <h2>{t('Зурхай авах','Get Your Reading')}</h2>
            <p className="subtitle">{t('Мэдээллээ оруулаад AI зурхайгаа авна уу','Enter your info and get your AI-powered reading')}</p>
          </div>
          <div className="promo-banner">
            <div className="promo-banner-text">{t('🎉 ','🎉 ')}<strong>{t('Эхний 1 сар 100% үнэгүй!','First month 100% FREE!')}</strong> {t('Бүртгүүлээд бүх Premium онцлогийг туршаарай.','Register and try all Premium features.')}</div>
            <div className="promo-countdown">{countdown}</div>
          </div>
          <div className="tradition-toggle">
            <button className={`trad-btn ${tradition==='western'?'active':''}`} onClick={()=>setTradition('western')}>☀ {t('Барууны','Western')}</button>
            <button className={`trad-btn ${tradition==='vedic'?'active':''}`} onClick={()=>setTradition('vedic')}>◎ {t('Ведик','Vedic')}</button>
          </div>
          <div className="service-tabs">
            {([['daily','☀ '+t('Өдрийн','Daily')],['natal','✦ Natal chart'],['love','♡ '+t('Хайрын нийцэл','Love Compat.')],['yearly','◈ '+t('Жилийн мэдээ','Yearly')]] as [Service,string][]).map(([s,label])=>(
              <button key={s} className={`stab ${service===s?'active':''}`} onClick={()=>setService(s)}>{label}</button>
            ))}
          </div>
          <div className="form-card">
            <p className="form-section-title">{t('Таны мэдээлэл','Your Information')}</p>
            <div className="field-grid">
              <div className="field full"><label>{t('Нэр','Name')}</label><input value={fName} onChange={e=>setFName(e.target.value)} placeholder={t('Таны нэр','Your name')}/></div>
              <div className="field"><label>{t('Төрсөн огноо','Birth Date')}</label><input type="date" value={fDate} onChange={e=>setFDate(e.target.value)}/></div>
              {service==='natal' && <>
                <div className="field"><label>{t('Төрсөн цаг','Birth Time')}</label><input type="time" value={fTime} onChange={e=>setFTime(e.target.value)}/></div>
                <div className="field"><label>{t('Төрсөн хот','Birth City')}</label><input value={fCity} onChange={e=>setFCity(e.target.value)} placeholder={t('Улаанбаатар','Ulaanbaatar')}/></div>
              </>}
            </div>
            {service==='love' && (
              <div>
                <div className="divider"/>
                <p className="form-section-title">{t('Хамтрагчийн мэдээлэл',"Partner's Information")}</p>
                <div className="field-grid">
                  <div className="field full"><label>{t('Хамтрагчийн нэр',"Partner's Name")}</label><input value={fPName} onChange={e=>setFPName(e.target.value)} placeholder={t('Хамтрагчийн нэр',"Partner's name")}/></div>
                  <div className="field"><label>{t('Хамтрагчийн огноо',"Partner's Birth Date")}</label><input type="date" value={fPDate} onChange={e=>setFPDate(e.target.value)}/></div>
                </div>
              </div>
            )}
            <div style={{height:18}}/>
            <button className="submit-btn" onClick={generateReading} disabled={readLoading}>✦ {t('Зурхай бэлтгэх','Generate Reading')}</button>
          </div>
          {readLoading && (
            <div className="loading-state show">
              <div className="loading-orb"/>
              <p className="loading-text">{readLoadText}</p>
              <div className="loading-steps"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div>
            </div>
          )}
          {reading && (
            <div className="result-card show">
              <div className="result-top">
                <div className="result-sign-big">{reading.sym}</div>
                <div className="result-meta">
                  <div className="result-name">{reading.name} · {reading.sign}</div>
                  <div className="result-type">{{daily:t('Өдрийн зурхай','Daily Horoscope'),natal:'Natal Chart',love:t('Хайрын нийцэл','Love Compatibility'),yearly:t(NOW.getFullYear()+' Жилийн мэдээ',NOW.getFullYear()+' Yearly Forecast')}[service]} · {tradition==='vedic'?'Vedic':'Western'}</div>
                </div>
                <div className="result-actions">
                  <button className="result-action-btn" onClick={()=>navigator.clipboard?.writeText(window.location.href).then(()=>showToast(t('Холбоос хуулагдлаа ✓','Link copied ✓')))}>{t('↗ Хуваалцах','↗ Share')}</button>
                  <button className="result-action-btn" onClick={()=>setPage('chat')}>◎ {t('AI-тай ярих','Chat with AI')}</button>
                </div>
              </div>
              {service==='natal' && <div className="natal-chart-wrap"><NatalChart signIdx={reading.si}/></div>}
              <div className="result-sections">
                {reading.sections.map((s,i)=>(
                  <div key={i} className="result-section">
                    <div className="result-section-title">{s.title}</div>
                    <div className="result-section-body">{s.body.map((line,j)=><p key={j}>{line}</p>)}</div>
                  </div>
                ))}
              </div>
              {reading.compat && (
                <div className="compat-bar-wrap">
                  <div className="compat-label"><span>{reading.compat.sign1} ♡ {reading.compat.sign2}</span><span>{reading.compat.pct}%</span></div>
                  <div className="compat-bar"><div className="compat-fill" style={{width:`${reading.compat.pct}%`}}/></div>
                </div>
              )}
              {reading.mongol && (
                <div style={{marginTop:18,paddingTop:18,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{fontSize:11,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--text3)',marginBottom:10}}>{t('Монгол уламжлалт мэдээлэл','Mongolian Tradition')}</div>
                  <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
                    <span style={{background:'rgba(192,97,74,0.1)',border:'1px solid rgba(192,97,74,0.2)',borderRadius:20,padding:'5px 13px',fontSize:12,color:'var(--red)'}}>{reading.mongol.animal} {t('жил','year')}</span>
                    <span style={{background:'rgba(201,169,110,0.08)',border:'1px solid rgba(201,169,110,0.2)',borderRadius:20,padding:'5px 13px',fontSize:12,color:'var(--gold)'}}>{reading.mongol.element} {t('элемент','element')}</span>
                    <button onClick={()=>setPage('mongol')} style={{background:'transparent',border:'1px solid rgba(201,169,110,0.2)',borderRadius:20,padding:'5px 13px',fontSize:12,color:'var(--text2)',cursor:'pointer'}}>{t('Дэлгэрэнгүй →','More →')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MONGOL ── */}
      <div className={`page ${page==='mongol'?'active':''}`}>
        <div className="mongol-wrap">
          <div className="mongol-hero-banner">
            <div style={{fontSize:44,marginBottom:14}}>᠁</div>
            <h2>{t('Монгол уламжлалт зурхай','Traditional Mongolian Astrology')}</h2>
            <p>{t('Билгийн тоолол, 12 жилийн амьтан, 9 мэнгэ, засал — эрт дээр үеийн өв мэдлэгийг орчин үеийн AI-тай хослуулав.','Bilgiin toolol, 12 animal years, 9 menge, zasal — ancient wisdom meets modern AI.')}</p>
          </div>

          {/* Daily */}
          <div className="mongol-daily-card">
            <div className="mongol-daily-header">
              <div>
                <div style={{fontSize:11,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--text3)',marginBottom:5}}>{t('Өнөөдрийн монгол зурхай',"Today's Mongolian Reading")}</div>
                <div className="mongol-daily-date">{NOW.getFullYear()} {MONTHS_MN[NOW.getMonth()]} {NOW.getDate()}</div>
              </div>
              <div className="mongol-daily-animal">{M_EMOJI[mdByear?animalIdx(parseInt(mdByear)):todayAnimalIdx]}</div>
            </div>
            <div style={{marginBottom:18}}>
              <div className="field-grid" style={{marginBottom:14}}>
                <div className="field"><label>{t('Төрсөн он','Birth Year')}</label><input type="number" value={mdByear} onChange={e=>{setMdByear(e.target.value)}} placeholder="1990" min={1900} max={2025}/></div>
                <div className="field"><label>{t('Хүйс','Gender')}</label><select value={mdGender} onChange={e=>setMdGender(e.target.value)}><option value="male">{t('Эрэгтэй','Male')}</option><option value="female">{t('Эмэгтэй','Female')}</option></select></div>
              </div>
              <button className="submit-btn mongol-btn" onClick={generateMongolDaily} disabled={mdLoading}>᠁ {t('Өнөөдрийн зурхай авах',"Get Today's Reading")}</button>
            </div>
            {mdLoading && <div style={{textAlign:'center',padding:20}}><div className="loading-orb" style={{width:46,height:46,margin:'0 auto 10px'}}/><p className="loading-text" style={{fontSize:15}}>{t('Монгол зурхай бэлтгэж байна...','Preparing Mongolian reading...')}</p></div>}
            {mdSections.length > 0 && (
              <div className="mongol-daily-sections">
                {mdSections.map((s,i)=>(
                  <div key={i} className="mongol-daily-section">
                    <div className="mongol-daily-section-title">{s.title}</div>
                    <div className="mongol-daily-section-body">{s.body.map((l,j)=><p key={j}>{l}</p>)}</div>
                  </div>
                ))}
              </div>
            )}
            {mdLucky && (
              <div className="lucky-row">
                <div className="lucky-item"><span>{t('Аз өнгө:','Lucky color:')}</span>{mdLucky.color}</div>
                <div className="lucky-item"><span>{t('Аз тоо:','Lucky number:')}</span>{mdLucky.num}</div>
                <div className="lucky-item"><span>{t('Сайн цаг:','Lucky time:')}</span>{mdLucky.time}</div>
              </div>
            )}
          </div>

          {/* Calc Mongol */}
          <div className="mongol-calc-card">
            <p className="form-section-title red">{t('Таны жил & мэнгэ тооцоолох','Calculate Your Year & Menge')}</p>
            <div className="field-grid">
              <div className="field"><label>{t('Төрсөн огноо','Birth Date')}</label><input type="date" value={mcBdate} onChange={e=>setMcBdate(e.target.value)}/></div>
              <div className="field"><label>{t('Хүйс','Gender')}</label><select value={mcGender} onChange={e=>setMcGender(e.target.value)}><option value="male">{t('Эрэгтэй','Male')}</option><option value="female">{t('Эмэгтэй','Female')}</option></select></div>
            </div>
            <div style={{height:14}}/>
            <button className="submit-btn mongol-btn" onClick={calcMongol}>᠁ {t('Тооцоолох','Calculate')}</button>
          </div>
          {mcResult && (
            <div className="mongol-info-box">
              <h4>{M_EMOJI[mcBdate?animalIdx(new Date(mcBdate).getFullYear()):0]} {t('Таны монгол зурхай','Your Mongolian Reading')}</h4>
              {[
                [t('Жилийн амьтан','Animal Sign'), mcResult.animal],
                [t('Элемент','Element'), mcResult.element],
                [t('Мэнгэ','Menge'), `${mcResult.menge} — ${mcResult.mengeName}`,'red'],
                [t('Мэнгэний утга','Menge Meaning'), mcResult.mengeDesc],
                [t('2026 оны байдал','2026 Outlook'), mcResult.year2026,'green'],
                [t('Засал шаардлагатай','Zasal Needed'), mcResult.zasal?t('⚠ Засал хийлгэх нь зүйтэй','⚠ Zasal recommended'):t('✓ Засал шаардлагагүй','✓ No zasal needed'), mcResult.zasal?'red':'green'],
              ].map(([label,value,cls])=>(
                <div key={label as string} className="mongol-row">
                  <span className="mongol-row-label">{label}</span>
                  <span className={`mongol-row-value ${cls||''}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Animal grid */}
          <div style={{height:28}}/>
          <div className="section-header" style={{textAlign:'left'}}>
            <p className="section-eyebrow">12 жилийн амьтан</p>
            <h2 className="section-title" style={{fontSize:26}}>{t('Жилийн тэмдэг','Animal Signs')}</h2>
          </div>
          <div className="year-animals-grid">
            {['хулгана','үхэр','бар','туулай','луу','могой','морь','хонь','бич','тахиа','нохой','гахай'].map(a=>(
              <div key={a} className={`year-animal-card ${selectedAnimal===a?'selected':''}`} onClick={()=>setSelectedAnimal(selectedAnimal===a?null:a)}>
                <span className="animal-emoji">{ANIMAL_INFO[a].e}</span>
                <span className="animal-name">{a.charAt(0).toUpperCase()+a.slice(1)}</span>
              </div>
            ))}
          </div>
          {selectedAnimal && (
            <div style={{marginTop:16}}>
              <div className="mongol-info-box">
                <h4>{ANIMAL_INFO[selectedAnimal].e} {selectedAnimal.charAt(0).toUpperCase()+selectedAnimal.slice(1)}</h4>
                <p style={{fontSize:14,color:'var(--text2)',lineHeight:1.7,marginTop:7}}>{ANIMAL_INFO[selectedAnimal].t}</p>
              </div>
            </div>
          )}

          {/* Menge */}
          <div style={{height:32}}/>
          <div className="section-header" style={{textAlign:'left'}}>
            <p className="section-eyebrow">9 мэнгэ</p>
            <h2 className="section-title" style={{fontSize:26}}>{t('Мэнгэний утга','Menge Meanings')}</h2>
          </div>
          <div className="menge-grid">
            {MENGE_DATA.map(m=>(
              <div key={m.num} className="menge-card">
                <div className="menge-num" style={{color:m.c}}>{m.num}</div>
                <div className="menge-name">{m.name}</div>
                <div className="menge-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHAT ── */}
      <div className={`page ${page==='chat'?'active':''}`}>
        <div className="chat-wrap">
          <div className="chat-header">
            <h2>{t('AI Зурхайн Зөвлөгч','AI Astrology Advisor')}</h2>
            <p>{t('Астрологийн дурын асуулт — хайр, карьер, хувь заяа, нийцэл','Ask anything — love, career, destiny, compatibility')}</p>
          </div>
          <div className="chat-messages">
            <div className="chat-msg ai">
              <div className="chat-avatar">✦</div>
              <div>
                <div className="chat-bubble">
                  <p>{t('Сайн байна уу! Би Tengri зурхайн AI зөвлөгч. Таны мэндэлсэн огноог хэлвэл илүү нарийн хариулт өгнө. Ямар асуулт байна?',"Hello! I'm Tengri's AI astrology advisor. Tell me your birth date for more personalized answers. What would you like to know?")}</p>
                </div>
                <div className="chat-suggestion-chips">
                  {[t('Би энэ хүнтэй тохирох уу?','Are we compatible?'),t('Ажлаа солих уу?','Should I change jobs?'),t('2026 он надад ямар байх вэ?','What will 2026 bring me?'),t('Миний мэнгэ юу вэ?','What is my menge?')].map(chip=>(
                    <button key={chip} className="chip" onClick={()=>sendChat(chip)}>{chip}</button>
                  ))}
                </div>
              </div>
            </div>
            {chatMessages.slice(1).map((msg,i)=>(
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-avatar">{msg.role==='ai'?'✦':'◉'}</div>
                <div className="chat-bubble">
                  {msg.text.split('\n').filter(l=>l.trim()).map((l,j)=><p key={j}>{l}</p>)}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-msg ai">
                <div className="chat-avatar">✦</div>
                <div className="chat-bubble typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>
          <div className="chat-input-bar">
            <input className="chat-input" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder={t('Асуулт бичнэ үү...','Type your question...')} onKeyDown={e=>e.key==='Enter'&&sendChat()}/>
            <button className="chat-send-btn" onClick={()=>sendChat()}>➤</button>
          </div>
        </div>
      </div>

      {/* ── CALENDAR ── */}
      <div className={`page ${page==='calendar'?'active':''}`}>
        <div className="calendar-wrap">
          <div className="page-heading">
            <h2>{t('Зурхайн Календар','Astrology Calendar')}</h2>
            <p className="subtitle">{t('Чухал үйл явдлуудаа тэмдэглэж, аз жаргалтай өдрүүдийг олоорой','Mark important events and discover your lucky days')}</p>
          </div>
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={()=>{if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11)}else setCalMonth(m=>m-1)}}>‹</button>
            <h3>{(lang==='mn'?MONTHS_MN:MONTHS_EN)[calMonth]} {calYear}</h3>
            <button className="cal-nav-btn" onClick={()=>{if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0)}else setCalMonth(m=>m+1)}}>›</button>
          </div>
          <div className="calendar-grid-head">
            {(lang==='mn'?DAYS_MN:DAYS_EN).map(d=><div key={d} className="cal-head-cell">{d}</div>)}
          </div>
          <div className="calendar-grid">
            {calCells.map((cell,i)=>(
              <div key={i} className={`cal-cell ${!cell.cur?'other-month':''} ${cell.isT?'today':''} ${cell.evs.length?'has-event':''}`} onClick={()=>cell.key&&setEvDate(cell.key)}>
                <div className="cal-date">{cell.day}</div>
                {cell.isL && <div className="cal-lucky">{t('✦ Азтай','✦ Lucky')}</div>}
                {cell.evs.length > 0 && <div className="cal-event-dot"/>}
                {cell.evs.slice(0,1).map((ev,j)=><div key={j} className="cal-event-item">{ev}</div>)}
              </div>
            ))}
          </div>
          <div className="cal-sidebar">
            <h4>{t('Үйл явдал нэмэх','Add Event')}</h4>
            <div className="cal-event-form">
              <input type="date" value={evDate} onChange={e=>setEvDate(e.target.value)}/>
              <input value={evText} onChange={e=>setEvText(e.target.value)} placeholder={t('Тэмдэглэл...','Note...')} style={{flex:2}} onKeyDown={e=>e.key==='Enter'&&addCalEvent()}/>
              <button className="cal-add-btn" onClick={addCalEvent}>{t('Нэмэх','Add')}</button>
            </div>
            <div className="event-list">
              {allEvents.length===0 && <div style={{fontSize:13,color:'var(--text3)',padding:'10px 0'}}>{t('Тэмдэглэл байхгүй байна.','No events yet.')}</div>}
              {allEvents.map(({date,ev},i)=>(
                <div key={i} className="event-item">
                  <div><div className="event-item-text">{ev}</div><div className="event-item-date">{date}</div></div>
                  <button className="event-del" onClick={()=>delCalEvent(date,(calEvents[date]||[]).indexOf(ev))}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── NUMEROLOGY ── */}
      <div className={`page ${page==='numerology'?'active':''}`}>
        <div className="numerology-wrap">
          <div className="page-heading">
            <h2>{t('Тоон зурхай','Numerology')}</h2>
            <p className="subtitle">{t('Нэр болон төрсөн огноогоор таны тоон хувь заяаг тодорхойлно','Discover your numerological destiny through name and birth date')}</p>
          </div>
          <div className="form-card">
            <p className="form-section-title">{t('Мэдээлэл оруулах','Enter Information')}</p>
            <div className="field-grid">
              <div className="field full"><label>{t('Бүтэн нэр (латин үсгээр)','Full Name (Latin letters)')}</label><input value={numName} onChange={e=>setNumName(e.target.value)} placeholder="Bat-Erdene"/></div>
              <div className="field"><label>{t('Төрсөн огноо','Birth Date')}</label><input type="date" value={numDate} onChange={e=>setNumDate(e.target.value)}/></div>
            </div>
            <div style={{height:18}}/>
            <button className="submit-btn" onClick={calcNumerology} disabled={numLoading}>✦ {t('Тоон зурхай тооцоолох','Calculate Numerology')}</button>
          </div>
          {numResult && (
            <>
              <div className="num-result-grid">
                {numResult.map((item,i)=>{
                  const m = NUM_MEANINGS[item.n]||{name:t('Тусгай тоо','Special Number'),desc:t('Онцгой утгатай.','Special meaning.')}
                  return (
                    <div key={i} className={`num-card ${item.highlight?'highlight':''}`}>
                      <div className="num-big">{item.n}</div>
                      <div className="num-label">{item.label}</div>
                      <div className="num-name">{m.name}</div>
                      <div className="num-desc">{m.desc}</div>
                    </div>
                  )
                })}
              </div>
              <div className="form-card" style={{marginTop:18}}>
                <p className="form-section-title">{t('AI тайлбар','AI Interpretation')}</p>
                {numLoading && <div style={{color:'var(--text3)',fontSize:13}}>{t('AI тайлбар бэлтгэж байна...','Preparing AI interpretation...')}</div>}
                {numAiText && <div style={{fontSize:14,color:'var(--text2)',lineHeight:1.9}}>{numAiText.split('\n').filter(l=>l.trim()).map((l,j)=><p key={j} style={{marginBottom:9}}>{l}</p>)}</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div className={`page ${page==='pricing'?'active':''}`}>
        <div className="pricing-wrap">
          <h2>{t('Үнийн санал','Pricing')}</h2>
          <p className="subtitle">{t('Өөрт тохирсон планыг сонгоно уу','Choose the plan that fits you')}</p>
          <span className="free-promo-note">{t('🎉 Эхний 1 сар бүх төлбөртэй планд 100% хямдрал! Зөвхөн шинэ хэрэглэгчдэд.','🎉 First month 100% off all paid plans! New users only.')}</span>
          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-name">{t('Үнэгүй','Free')}</div>
              <div className="plan-price-wrap"><span className="plan-price">₮0</span></div>
              <div className="plan-period">{t('сар бүр','per month')}</div>
              <ul className="plan-features">
                <li>{t('Өдрийн зурхай — өдөрт 3 удаа','Daily horoscope — 3x/day')}</li>
                <li>{t('Монгол зурхай & мэнгэ','Mongolian & menge calc.')}</li>
                <li>{t('Тоон зурхай','Numerology')}</li>
              </ul>
              <button className="plan-btn plan-btn-outline" onClick={()=>setAuthModal(true)}>{t('Эхлэх','Start Free')}</button>
            </div>
            <div className="plan-card featured">
              <div className="plan-badge">{t('Хамгийн алдартай','Most Popular')}</div>
              <div className="plan-name">{t('Стандарт','Standard')}</div>
              <div className="plan-promo-label">✓ {t('Эхний сар үнэгүй','First month free')}</div>
              <div className="plan-price-wrap"><span className="plan-price">₮0</span><span className="plan-price-orig">₮19,900</span></div>
              <div className="plan-period">{t('эхний сар · дараагаас ₮19,900','first month · then ₮19,900')}</div>
              <ul className="plan-features">
                <li>{t('Бүх төрлийн зурхай','All reading types')}</li>
                <li>Natal chart + {t('диаграм','diagram')}</li>
                <li>AI {t('зөвлөгч (сарын 30)','advisor (30/month)')}</li>
                <li>{t('Монгол засал тооцоо','Mongolian zasal')}</li>
                <li>{t('Хайрын нийцэл','Love compatibility')}</li>
              </ul>
              <button className="plan-btn plan-btn-filled" onClick={()=>setCardModal(true)}>{t('Картаа холбох','Connect Card')}</button>
            </div>
            <div className="plan-card">
              <div className="plan-name">{t('Премиум','Premium')}</div>
              <div className="plan-promo-label">✓ {t('Эхний сар үнэгүй','First month free')}</div>
              <div className="plan-price-wrap"><span className="plan-price">₮0</span><span className="plan-price-orig">₮39,900</span></div>
              <div className="plan-period">{t('эхний сар · дараагаас ₮39,900','first month · then ₮39,900')}</div>
              <ul className="plan-features">
                <li>{t('Хязгааргүй хэрэглээ','Unlimited usage')}</li>
                <li>Vedic + Western + {t('Монгол','Mongolian')}</li>
                <li>AI {t('зөвлөгч хязгааргүй','advisor unlimited')}</li>
                <li>PDF {t('тайлан татах','report download')}</li>
                <li>{t('Тэргүүлэх дэмжлэг','Priority support')}</li>
              </ul>
              <button className="plan-btn plan-btn-outline" onClick={()=>setCardModal(true)}>{t('Картаа холбох','Connect Card')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT ── */}
      <div className={`page ${page==='account'?'active':''}`}>
        <div className="account-wrap">
          {user ? <>
            <div className="account-header">
              <div className="account-avatar">{user.name[0].toUpperCase()}</div>
              <div>
                <div className="account-name">{user.name}</div>
                <div className="account-plan">{t('Стандарт план · Эхний сар үнэгүй','Standard plan · First month free')}</div>
              </div>
            </div>
            <p className="section-label">{t('Зурхайн түүх','Reading History')}</p>
            <div>
              {history.map((h,i)=>(
                <div key={i} className="history-card">
                  <div className="history-left">
                    <div className="history-icon">{h.icon}</div>
                    <div><div className="history-title">{h.title}</div><div className="history-date">{h.date}</div></div>
                  </div>
                  <div className="history-badge">{h.badge}</div>
                </div>
              ))}
            </div>
          </> : <div style={{textAlign:'center',padding:'60px 20px'}}>
            <p style={{color:'var(--text2)',marginBottom:20}}>{t('Нэвтэрч ороогүй байна.','You are not signed in.')}</p>
            <button className="btn-primary" onClick={()=>setAuthModal(true)}>{t('Нэвтрэх','Sign In')}</button>
          </div>}
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <div className="modal-overlay show" onClick={e=>{if(e.target===e.currentTarget)setAuthModal(false)}}>
          <div className="modal">
            <button className="modal-close" onClick={()=>setAuthModal(false)}>✕</button>
            <div className="modal-logo">᠁ TENGRI HOROSCOPE</div>
            <div className="modal-tabs">
              <button className={`modal-tab ${authTab==='login'?'active':''}`} onClick={()=>setAuthTab('login')}>{t('Нэвтрэх','Sign In')}</button>
              <button className={`modal-tab ${authTab==='register'?'active':''}`} onClick={()=>setAuthTab('register')}>{t('Бүртгүүлэх','Register')}</button>
            </div>
            {authTab==='login' ? (
              <>
                <div className="modal-field"><label>{t('И-мэйл','Email')}</label><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="email@example.com"/></div>
                <div className="modal-field"><label>{t('Нууц үг','Password')}</label><input type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="••••••••"/></div>
                <button className="modal-submit" onClick={doLogin}>{t('Нэвтрэх','Sign In')}</button>
              </>
            ) : (
              <>
                <div className="modal-field"><label>{t('Нэр','Name')}</label><input value={regName} onChange={e=>setRegName(e.target.value)} placeholder={t('Таны нэр','Your name')}/></div>
                <div className="modal-field"><label>{t('И-мэйл','Email')}</label><input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="email@example.com"/></div>
                <div className="modal-field"><label>{t('Нууц үг','Password')}</label><input type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="••••••••"/></div>
                <div className="modal-field"><label>{t('Төрсөн огноо','Birth Date')}</label><input type="date" value={regBdate} onChange={e=>setRegBdate(e.target.value)}/></div>
                <button className="modal-submit" onClick={doRegister}>{t('Бүртгүүлэх','Register')}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CARD MODAL ── */}
      {cardModal && (
        <div className="card-modal-overlay show" onClick={e=>{if(e.target===e.currentTarget)setCardModal(false)}}>
          <div className="card-modal">
            <button className="card-modal-close" onClick={()=>setCardModal(false)}>✕</button>
            <h3 style={{fontFamily:'var(--font-cormorant),serif',fontSize:26,fontWeight:300,color:'var(--text)',marginBottom:8}}>{t('Картаа холбох','Connect Your Card')}</h3>
            <p style={{fontSize:13,color:'var(--text2)',marginBottom:18,lineHeight:1.6}}>{t('Эхний 1 сар 100% үнэгүй. Дараагийн сараас автоматаар тооцогдоно. Хүссэн үедээ цуцлах боломжтой.','First month 100% free. Auto-renews from next month. Cancel anytime.')}</p>
            <div className="card-icons">
              <span className="card-icon-badge">💳 Visa</span>
              <span className="card-icon-badge">💳 Mastercard</span>
              <span className="card-icon-badge">🔒 {t('Аюулгүй','Secure')}</span>
            </div>
            <div className="modal-field"><label>{t('Картын дугаар','Card Number')}</label><input value={cardNum} onChange={e=>setCardNum(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19))} placeholder="1234 5678 9012 3456" maxLength={19}/></div>
            <div className="field-grid">
              <div className="modal-field"><label>{t('Дуусах хугацаа','Expiry')}</label><input value={cardExp} onChange={e=>setCardExp(e.target.value)} placeholder="MM/YY" maxLength={5}/></div>
              <div className="modal-field"><label>CVV</label><input value={cardCvv} onChange={e=>setCardCvv(e.target.value)} placeholder="•••" maxLength={3}/></div>
            </div>
            <button className="modal-submit" onClick={submitCard}>✦ {t('Эхлэх — эхний сар үнэгүй','Start — first month free')}</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toastShow?'show':''}`}>{toast}</div>
    </>
  )
}