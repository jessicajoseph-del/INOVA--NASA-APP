import tempfile
from pathlib import Path
from datetime import date, timedelta
from fastapi.testclient import TestClient
import main

with tempfile.TemporaryDirectory() as tmp:
    main.DB=Path(tmp)/'test.sqlite'
    main.initialize()
    client=TestClient(main.app)
    today=date.today().isoformat()
    state=client.get('/api/state').json()
    stock=next(f['stock_g'] for f in state['foods'] if f['id']=='rice')
    payload={'day':today,'slot':'lunch','time':'12:30','items':[{'food_id':'rice','grams':100}]}
    res=client.post('/api/meals',json=payload)
    assert res.status_code==200,res.text
    mid=res.json()['id']
    state=client.get('/api/state').json()
    rice=next(f for f in state['foods'] if f['id']=='rice')
    assert rice['stock_g']==stock and rice['reserved_g']==100
    payload['slot']='dinner';payload['items'][0]['grams']=stock
    assert client.post('/api/meals',json=payload).status_code==409
    payload['items'][0]['grams']=-1
    assert client.post('/api/meals',json=payload).status_code==422
    assert client.post(f'/api/meals/{mid}/eat',json={'fraction':.5}).status_code==200
    assert client.post(f'/api/meals/{mid}/eat',json={'fraction':.5}).status_code==409
    state=client.get('/api/state').json()
    rice=next(f for f in state['foods'] if f['id']=='rice')
    assert rice['stock_g']==stock-50 and rice['reserved_g']==0
    meal=next(m for m in state['meals'] if m['id']==mid)
    assert meal['consumption']['totals']['kcal']==65
    assert client.delete(f'/api/meals/{mid}').status_code==409
    tomorrow=(date.today()+timedelta(days=1)).isoformat()
    assert client.post(f'/api/meals/{mid}/copy',json={'target_day':tomorrow,'target_slot':'lunch'}).status_code==200
    assert client.post(f'/api/meals/{mid}/copy',json={'target_day':tomorrow,'target_slot':'lunch'}).status_code==409
print('All API smoke tests passed.')
