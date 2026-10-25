"""TAM / SAM / SOM 2025-2030 for the localSpace investor page.
2025 is one known base for every case. Cases differ only in how fast the market grows after 2025.
TAM base: GMI Insights, company spending on LLMs, $8.65B in 2025.
Growth: min 13.5% a year (GMI), mid 20.2% (Market.us, sovereign AI), max 28.3% (Research and Markets, enterprise LLM).
SAM: Central Asia = TAM x 0.495% (IMF 2025 GDP share), kept flat.
SOM: Uzbekistan, our own seat plan x $108 a year per seat; 2025 and 2026 are actual (no revenue)."""
import json
years=list(range(2025,2031))
CA_SHARE=570.634/115300
BASE=8.65
growth={
 "min":dict(cagr=0.135,source="GMI Insights, Enterprise LLM Market: 13.5% a year (2026-2035)"),
 "mid":dict(cagr=0.202,source="Market.us, Sovereign AI Market: 20.2% a year (2026-2035)"),
 "max":dict(cagr=0.283,source="Research and Markets, Enterprise LLM Market: 28.3% a year (2025-2033)"),
}
seats={"min":[0,0,60,400,1000,2000],"mid":[0,0,300,2000,5900,9000],"max":[0,0,800,5000,12000,20000]}
out=dict(base_year=2025,base=dict(tam_busd=BASE,sam_musd=round(BASE*CA_SHARE*1000,1),som_usd=0,
  tam_source="GMI Insights, Enterprise LLM Market: $8.65B in 2025 (of which on-premises $1.55B)",
  sam_source="IMF 2025: Central Asia $570.6B of world $115.3T = 0.495%",som_note="No revenue yet"),
  central_asia_gdp_share=CA_SHARE,price_per_seat_year=108,years=years,
  note="2025 is the same in every case. Min, mid and max differ only in growth after 2025. 2026 SOM is actual: no revenue.",scenarios={})
for k,g in growth.items():
    tam=[BASE*(1+g["cagr"])**(y-2025) for y in years]
    out["scenarios"][k]=dict(growth_per_year=g["cagr"],growth_source=g["source"],
        tam_busd=[round(x,2) for x in tam],sam_musd=[round(x*CA_SHARE*1000,1) for x in tam],
        som_seats=seats[k],som_musd=[round(s*108/1e6,3) for s in seats[k]])
json.dump(out,open("data/market.json","w"),indent=1,ensure_ascii=False)
for k,v in out["scenarios"].items(): print(k,v["tam_busd"],v["sam_musd"],v["som_musd"],"SOM/SAM 2030 %.2f%%"%(100*v["som_musd"][-1]/v["sam_musd"][-1]))
