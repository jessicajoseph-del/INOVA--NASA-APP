from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from pathlib import Path
from datetime import date
import sqlite3, json

BASE = Path(__file__).resolve().parent
DB = BASE / 'kitchen.sqlite'
app = FastAPI(title='Space Kitchen — local demonstration')
app.mount('/static', StaticFiles(directory=BASE / 'static'), name='static')
SLOTS = ['breakfast','lunch','snacks','dinner']
TIMES = {'breakfast':'08:00','lunch':'12:30','snacks':'16:00','dinner':'19:00'}
# All composition, availability and storage values below are synthetic demonstration data.
SEEDS = [
('rice','Cooked brown rice','prepared',1000,100,130,2.7,28,1,1.8,5,'amber','Keep sealed; demo storage only'),
('chicken','Prepared chicken curry','prepared',900,100,160,20,8,5,1,350,'rust','Use approved preparation procedure'),
('vegetables','Cooked mixed vegetables','prepared',800,100,65,3,10,1.5,3.5,70,'green','Demo item — not flight qualified'),
('eggs','Prepared scrambled eggs','prepared',500,100,155,12,2,11,0,180,'gold','Demo prepared food'),
('bread','Wheat flatbread','ingredients',600,60,190,5,33,5,1.6,380,'cream','Sealed dry storage; demonstration'),
('banana','Banana','snacks',600,100,89,1.1,23,0.3,2.6,1,'yellow','Fresh food availability is illustrative'),
('almonds','Almonds','snacks',400,30,174,6,6,15,3.5,1,'brown','Contains nuts'),
('oats','Prepared oatmeal','prepared',800,150,150,5,27,3,4,90,'cream','Prepared food; demo storage only'),
('salmon','Prepared salmon','prepared',500,100,170,23,0,8,0,300,'coral','Contains fish'),
('soup','Vegetable soup','prepared',900,200,100,4,16,2,3,400,'rust','Demo storage only'),
('milk','Milk beverage','drinks',1000,200,100,7,10,3.5,0,90,'cream','Contains dairy; demo storage only'),
('juice','Orange beverage','drinks',1000,200,90,1,21,0,0,10,'orange','Demo prepared beverage'),
('water','Drinking water','drinks',3000,250,0,0,0,0,0,0,'blue','Demo water allocation'),
('bar','Energy bar','snacks',400,50,200,8,25,8,3,140,'brown','Check product allergens'),
('spice','Seasoning blend','ingredients',100,5,10,0.3,2,0.1,0.5,120,'rust','Demonstration seasoning')]

def connection():
    c=sqlite3.connect(DB, timeout=15, isolation_level=None)
    c.row_factory=sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    return c

def initialize():
    with connection() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS profile(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS foods(id TEXT PRIMARY KEY,name TEXT,category TEXT,stock_g REAL,portion_g REAL,kcal REAL,protein REAL,carbs REAL,fat REAL,fiber REAL,sodium REAL,color TEXT,storage TEXT,expiry TEXT);
        CREATE TABLE IF NOT EXISTS meals(id INTEGER PRIMARY KEY,day TEXT,slot TEXT,time TEXT,status TEXT DEFAULT 'planned',started INTEGER DEFAULT 0,baseline TEXT,UNIQUE(day,slot));
        CREATE TABLE IF NOT EXISTS items(meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,food_id TEXT REFERENCES foods(id),grams REAL,PRIMARY KEY(meal_id,food_id));
        CREATE TABLE IF NOT EXISTS consumption(id INTEGER PRIMARY KEY,meal_id INTEGER UNIQUE REFERENCES meals(id),fraction REAL,totals TEXT,items TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        """)
        p={'name':'Alex Morgan','weight_kg':75,'height_cm':175,'age':35,'gender':'Not specified','kcal_target':2400,'protein_target':100,'carbs_target':300,'fat_target':80}
        c.execute('INSERT OR IGNORE INTO profile VALUES(1,?)',(json.dumps(p),))
        from datetime import timedelta
        expiry=(date.today()+timedelta(days=30)).isoformat()
        for x in SEEDS:
            id,name,cat,stock,portion,kcal,protein,carbs,fat,fiber,sodium,color,storage=x
            c.execute('INSERT OR IGNORE INTO foods VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(id,name,cat,stock,portion,kcal,protein,carbs,fat,fiber,sodium,color,storage,expiry))
initialize()

class Profile(BaseModel):
    name: str = Field(min_length=1,max_length=80)
    weight_kg: float = Field(gt=0,le=500)
    height_cm: float = Field(gt=0,le=300)
    age: int = Field(ge=1,le=120)
    gender: str = Field(max_length=40)
    kcal_target: float = Field(gt=0,le=10000)
    protein_target: float = Field(gt=0,le=1000)
    carbs_target: float = Field(gt=0,le=2000)
    fat_target: float = Field(gt=0,le=1000)
class Item(BaseModel):
    food_id: str
    grams: float = Field(gt=0,le=100000)
class Meal(BaseModel):
    day: date
    slot: str
    time: str = Field(pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    items: list[Item] = Field(max_length=50)
class Eat(BaseModel):
    fraction: float = Field(gt=0,le=1)
class Copy(BaseModel):
    target_day: date
    target_slot: str

def totals(rows):
    t={k:0.0 for k in ['kcal','protein','carbs','fat','fiber','sodium','mass']}
    for r in rows:
        t['mass']+=r['grams']
        for k in t:
            if k!='mass': t[k]+=r[k]*r['grams']/r['portion_g']
    return {k:round(v,2) for k,v in t.items()}

def meal_data(c,m):
    d=dict(m)
    rows=[dict(x) for x in c.execute('SELECT f.*,i.grams FROM items i JOIN foods f ON f.id=i.food_id WHERE meal_id=?',(m['id'],))]
    d['items']=rows; d['totals']=totals(rows); d['baseline']=json.loads(d['baseline']) if d['baseline'] else None
    eaten=c.execute('SELECT * FROM consumption WHERE meal_id=?',(m['id'],)).fetchone()
    d['consumption']=dict(eaten) if eaten else None
    if eaten: d['consumption']['totals']=json.loads(eaten['totals'])
    return d

def reserve(c,exclude=None):
    args=() if exclude is None else (exclude,)
    extra='' if exclude is None else ' AND m.id!=?'
    return {r['food_id']:r['g'] for r in c.execute("SELECT i.food_id,SUM(i.grams) g FROM items i JOIN meals m ON m.id=i.meal_id WHERE m.status='planned'"+extra+' GROUP BY i.food_id',args)}

def save_meal(c,p):
    if p.slot not in SLOTS: raise HTTPException(400,'Invalid meal slot')
    day=p.day.isoformat()
    if p.day < date.today(): raise HTTPException(400,'Cannot create or edit a past meal')
    old=c.execute('SELECT * FROM meals WHERE day=? AND slot=?',(day,p.slot)).fetchone()
    if old and old['status']=='eaten': raise HTTPException(409,'Eaten meals are locked')
    if len({i.food_id for i in p.items})!=len(p.items): raise HTTPException(400,'Duplicate food items')
    reservations=reserve(c,old['id'] if old else None)
    values=[]
    for i in p.items:
        f=c.execute('SELECT * FROM foods WHERE id=?',(i.food_id,)).fetchone()
        if not f: raise HTTPException(400,'Unknown food')
        if f['expiry']<day: raise HTTPException(409,f"{f['name']}: demo expiry is before the meal date")
        available=f['stock_g']-reservations.get(i.food_id,0)
        if i.grams>available+1e-6: raise HTTPException(409,f"{f['name']}: only {max(0,available):g} g unreserved")
        values.append(dict(f,grams=i.grams))
    if not old:
        cur=c.execute('INSERT INTO meals(day,slot,time,baseline) VALUES(?,?,?,?)',(day,p.slot,p.time,json.dumps(totals(values))))
        mid=cur.lastrowid
    else:
        mid=old['id']; c.execute('UPDATE meals SET time=?,started=0 WHERE id=?',(p.time,mid))
        c.execute('DELETE FROM items WHERE meal_id=?',(mid,))
    for i in p.items: c.execute('INSERT INTO items VALUES(?,?,?)',(mid,i.food_id,i.grams))
    return mid

@app.get('/')
def index(): return FileResponse(BASE/'static'/'index.html')

@app.get('/api/state')
def state():
    with connection() as c:
        reserved=reserve(c)
        foods=[dict(f) for f in c.execute('SELECT * FROM foods ORDER BY name')]
        for f in foods:
            f['reserved_g']=reserved.get(f['id'],0)
            f['available_g']=max(0,round(f['stock_g']-f['reserved_g'],2))
        return {'profile':json.loads(c.execute('SELECT data FROM profile WHERE id=1').fetchone()[0]),'foods':foods,'meals':[meal_data(c,m) for m in c.execute('SELECT * FROM meals ORDER BY day,time')],'today':date.today().isoformat(),'data_status':'ALL FOOD VALUES ARE SYNTHETIC DEMO DATA'}

@app.put('/api/profile')
def profile(p:Profile):
    with connection() as c: c.execute('UPDATE profile SET data=? WHERE id=1',(json.dumps(p.model_dump()),))
    return {'ok':True}

@app.post('/api/meals')
def save(p:Meal):
    c=connection()
    try:
        c.execute('BEGIN IMMEDIATE'); mid=save_meal(c,p); c.commit(); return {'id':mid}
    except: c.rollback(); raise
    finally: c.close()

@app.post('/api/meals/{mid}/copy')
def copy(mid:int,p:Copy):
    c=connection()
    try:
        c.execute('BEGIN IMMEDIATE')
        m=c.execute('SELECT * FROM meals WHERE id=?',(mid,)).fetchone()
        if not m: raise HTTPException(404,'Meal not found')
        if c.execute('SELECT id FROM meals WHERE day=? AND slot=?',(p.target_day.isoformat(),p.target_slot)).fetchone(): raise HTTPException(409,'Destination already has a meal; edit it or clear it first')
        items=[Item(food_id=r['food_id'],grams=r['grams']) for r in c.execute('SELECT * FROM items WHERE meal_id=?',(mid,))]
        new=save_meal(c,Meal(day=p.target_day,slot=p.target_slot,time=TIMES.get(p.target_slot,'12:30'),items=items))
        c.commit();return {'id':new}
    except: c.rollback();raise
    finally:c.close()

@app.post('/api/meals/{mid}/start')
def start(mid:int):
    with connection() as c:
        m=c.execute('SELECT * FROM meals WHERE id=?',(mid,)).fetchone()
        if not m: raise HTTPException(404,'Meal not found')
        if m['day']!=date.today().isoformat(): raise HTTPException(409,'Eating actions are available only for today')
        if m['status']=='eaten': raise HTTPException(409,'Already eaten')
        c.execute('UPDATE meals SET started=1 WHERE id=?',(mid,))
    return {'ok':True}

@app.post('/api/meals/{mid}/eat')
def eat(mid:int,p:Eat):
    c=connection()
    try:
        c.execute('BEGIN IMMEDIATE')
        m=c.execute('SELECT * FROM meals WHERE id=?',(mid,)).fetchone()
        if not m: raise HTTPException(404,'Meal not found')
        if m['status']=='eaten': raise HTTPException(409,'Already recorded; inventory was not deducted again')
        if m['day']!=date.today().isoformat(): raise HTTPException(409,'Can record consumption only for today')
        rows=[dict(r) for r in c.execute('SELECT f.*,i.grams FROM items i JOIN foods f ON f.id=i.food_id WHERE meal_id=?',(mid,))]
        if not rows: raise HTTPException(400,'Empty meal')
        eaten=[]
        for r in rows:
            g=r['grams']*p.fraction
            if r['expiry']<m['day']:raise HTTPException(409,'An item has expired; edit meal first')
            if g>r['stock_g']+1e-6:raise HTTPException(409,'Not enough stock')
            c.execute('UPDATE foods SET stock_g=MAX(0,stock_g-?) WHERE id=?',(g,r['id']))
            eaten.append(dict(r,grams=g))
        t=totals(eaten)
        c.execute('INSERT INTO consumption(meal_id,fraction,totals,items) VALUES(?,?,?,?)',(mid,p.fraction,json.dumps(t),json.dumps(eaten)))
        c.execute("UPDATE meals SET status='eaten' WHERE id=?",(mid,));c.commit()
        return {'totals':t,'note':'Demo deducts only the confirmed consumed fraction; remaining portion is released to pantry. Real preparation/waste tracking is not implemented.'}
    except:c.rollback();raise
    finally:c.close()

@app.delete('/api/meals/{mid}')
def delete(mid:int):
    c=connection()
    try:
        c.execute('BEGIN IMMEDIATE')
        m=c.execute('SELECT * FROM meals WHERE id=?',(mid,)).fetchone()
        if not m:raise HTTPException(404,'Meal not found')
        if m['status']=='eaten':raise HTTPException(409,'Cannot delete a consumption record')
        c.execute('DELETE FROM meals WHERE id=?',(mid,));c.commit()
        return {'ok':True}
    except:c.rollback();raise
    finally:c.close()
