import json
years=list(range(2025,2031))
CA_SHARE=570.634/115300   # Central Asia GDP / world GDP, IMF 2025
tam_def={
 "min":dict(label="Narrow: LLM software run on companies' own servers",base=1.55,cagr=0.148,source="GMI Insights, Enterprise LLM Market (on-premises segment): $1.55B in 2025, 14.8% a year"),
 "mid":dict(label="Middle: all company spending on LLMs (the spend local AI competes for)",base=8.65,cagr=0.135,source="GMI Insights, Enterprise LLM Market: $8.65B in 2025, 13.5% a year"),
 "max":dict(label="Broad: on-premises enterprise AI of every kind",base=155.2*0.342/(1.376**5),cagr=0.376,source="Grand View Research, Enterprise AI Market: $155.2B by 2030, 37.6% a year; on-premises ≈34.2% (100% − 65.8% cloud)"),
}
seats={"min":[0,0,60,400,1000,2000],"mid":[0,0,300,2000,5900,9000],"max":[0,0,800,5000,12000,20000]}
out=dict(central_asia_gdp_share=CA_SHARE,price_per_seat_year=108,years=years,scenarios={})
for k,d in tam_def.items():
    tam=[d["base"]*(1+d["cagr"])**(y-2025) for y in years]
    sam=[x*CA_SHARE*1000 for x in tam]   # $M
    som=[s*108/1e6 for s in seats[k]]     # $M
    out["scenarios"][k]=dict(tam_label=d["label"],tam_source=d["source"],tam_busd=[round(x,2) for x in tam],
        sam_musd=[round(x,1) for x in sam],som_seats=seats[k],som_musd=[round(x,3) for x in som])
json.dump(out,open("data/market.json","w"),indent=1,ensure_ascii=False)
print("share",CA_SHARE)
for k,v in out["scenarios"].items():
    print(k,"TAM",v["tam_busd"]);print("  SAM",v["sam_musd"]);print("  SOM",v["som_musd"], "share 2030 %.2f%%"%(100*v["som_musd"][-1]/v["sam_musd"][-1]))
