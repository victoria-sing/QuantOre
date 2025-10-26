const csvData = `
"Rank","Name","Symbol","marketcap","price (USD)","country"
"1","BHP Group","BHP","142508982272","55.62","Australia"
"2","China Shenhua Energy","601088.SS","115684445106","5.96818","China"
"3","Rio Tinto","RIO","112893132800","70.54","United Kingdom"
"4","Zijin Mining","601899.SS","110364296070","4.21705","China"
"5","Southern Copper","SCCO","105048522752","129.34","United States"
"6","Newmont","NEM","91577753600","83.37","United States"
"7","Agnico Eagle Mines","AEM","82057568256","163.35","Canada"
"8","Ma'aden","1211.SR","66440951671","17.12","Saudi Arabia"
"9","Grupo México","GMBXF","63875444736","8.2","Mexico"
"10","Freeport-McMoRan","FCX","59397971968","41.37","United States"
"11","Barrick Gold","B","55410675712","32.61","Canada"
"12","Glencore","GLEN.L","55319803623","5.40536","Switzerland"
"13","Vale","VALE","54269190144","12.42","Brazil"
"14","CMOC","603993.SS","52564243642","2.11584","China"
"15","Wheaton Precious Metals","WPM","49899386880","110.15","Canada"
"16","Fortescue","FMG.AX","46071477141","14.97","Australia"
"17","Anglo American","AAL.L","45591322049","41.16","United Kingdom"
"18","Cameco","CCJ","43003056128","98.77","Canada"
"19","Franco-Nevada","FNV","41029419008","212.87","Canada"
"20","Bayan Resources","BYAN.JK","40954086400","1.22862","Indonesia"
"21","Gold Fields","GFI","40393248768","45.14","South Africa"
"22","Antofagasta","ANTO.L","39316668749","39.88","United Kingdom"
"23","Polyus","PLZL.ME","38965935811","28.46","Russia"
"24","AngloGold Ashanti","AU","38760972288","76.79","South Africa"
"25","Kinross Gold","KGC","32679233536","26.82","Canada"
"26","Nutrien","NTR","31649297984","65.15","Canada"
"27","Coal India","COALINDIA.NS","30978938165","4.98971","India"
"28","China Northern Rare Earth (CNREHT)","600111.SS","29099499314","8.04652","China"
"29","Nornickel","GMKN.ME","26903678077","1.85404","Russia"
"30","Shandong Gold Mining","600547.SS","25841022137","5.71184","China"
"31","China Coal Energy Company Limited","601898.SS","25692015243","2.08846","China"
"32","Northern Star","NST.AX","24722521949","17.29","Australia"
"33","Vedanta","VEDL.NS","24683058864","6.3262","India"
"34","Fresnillo","FNLPF","24075587584","32.66","Mexico"
"35","Teck Resources","TECK","23229671424","47.61","Canada"
"36","Yankuang Energy (Yanzhou Coal Mining)","600188.SS","20366838038","2.35338","China"
"37","First Quantum Minerals","FM.TO","20230230016","24.26","Canada"
"38","Ganfeng Lithium","002460.SZ","19263155160","10.11","China"
"39","Zhejiang Huayou Cobalt","603799.SS","18805626359","10.01","China"
"40","Lundin Gold","LUG.TO","18478446592","76.54","Canada"
"41","Industrias Peñoles","PE&OLES.MX","17743906326","44.64","Mexico"
"42","Royal Gold","RGLD","17246543872","204.37","United States"
"43","Zhongjin Gold","600489.SS","17231454652","3.5152","China"
"44","Kazatomprom","0ZQ.F","17208362623","57.31","Kazakhstan"
"45","Pan American Silver","PAAS","17173827584","40.72","Canada"
"46","Ivanhoe Mines","IVN.TO","16830726144","12.66","Canada"
"47","Evolution Mining","EVN.AX","15545224357","7.66236","Australia"
"48","Zhaojin Mining Industry Company","1818.HK","15000000000","4.1884","China"
"49","Alamos Gold","AGI","14856015872","35.34","Canada"
"50","Metso","METSO.HE","14798679059","17.81","Finland"
`.trim();

const miningSitesCsvData = `
Rank,Company,Site Name,Commondity,Longitude,Latitude
1,BHP,Mt Whaleback (Newman),Iron Ore,119.75° E,-22.55° S
,BHP,Mining Area C,Iron Ore,119.58° E,-22.22° S
,BHP,Yandi,Iron Ore,118.58° E,-21.55° S
,BHP,Jimblebar,Iron Ore,120.03° E,-23.37° S
,BHP,South Flank,Iron Ore,118.60° E,-21.60° S
,BHP,Leinster,Nickel,121.47° E,-30.75° S
,BHP,Mt Keith,Nickel,121.55° E,-30.20° S
,BHP,Cliffs,Nickel,121.50° E,-30.30° S
,BHP,West Musgrave,Nickel-Copper,129.00° E,-28.50° S
,BHP,Olympic Dam,Copper-Uranium-Gold-Silver,136.88° E,-30.48° S
,BHP,Cannington,Silver-Lead-Zinc,142.97° E,-22.17° S
,BHP,Mt Arthur,Coal (Thermal/Metallurgical),150.80° E,-32.38° S
,BHP,Appin (Illawarra),Coal (Metallurgical),150.78° E,-34.20° S
,BHP,Dendrobium (Illawarra),Coal (Metallurgical),150.82° E,-34.22° S
,BHP,Broadmeadow,Coal (Metallurgical),148.27° E,-21.55° S
,BHP,Goonyella Riverside,Coal (Metallurgical),148.15° E,-21.50° S
,BHP,Daunia,Coal (Metallurgical),148.33° E,-22.10° S
,BHP,Peak Downs,Coal (Metallurgical),148.28° E,-22.15° S
,BHP,Saraji,Coal (Metallurgical),148.32° E,-22.20° S
,BHP,Blackwater,Coal (Metallurgical),148.88° E,-23.58° S
,BHP,Caval Ridge,Coal (Metallurgical),148.25° E,-22.05° S
,BHP,Escondida,Copper-Gold-Silver,69.07° W,-24.28° S
,BHP,Spence,Copper-Molybdenum,69.23° W,-22.85° S
,BHP,Cerro Colorado,Copper,69.60° W,-21.00° S
,BHP,Jansen,Potash,105.80° W,51.80° N
3,Rio Tinto,Marandoo,Iron Ore,117.70° E,-22.63° S
,Rio Tinto,Tom Price,Iron Ore,117.78° E,-22.70° S
,Rio Tinto,Paraburdoo,Iron Ore,117.67° E,-23.20° S
,Rio Tinto,Yandicoogina (Yandi),Iron Ore,119.20° E,-22.73° S
,Rio Tinto,Robe Valley (Mesa A, J, Warramboo),Iron Ore,116.85° E,-21.75° S
,Rio Tinto,West Angelas,Iron Ore,118.72° E,-23.13° S
,Rio Tinto,Hope Downs,Iron Ore,119.00° E,-23.00° S
,Rio Tinto,Gudai-Darri,Iron Ore,119.25° E,-22.40° S
,Rio Tinto,Weipa,Bauxite,141.93° E,-12.67° S
,Rio Tinto,Gove (Bauxite),Bauxite,136.87° E,-12.28° S
,Rio Tinto,Boyne Smelter,Aluminium,151.27° E,-23.85° S
,Rio Tinto,Tomago Smelter,Aluminium,151.75° E,-32.83° S
,Rio Tinto,Bell Bay Smelter,Aluminium,146.82° E,-41.13° S
Tiwai Point Smelter,Aluminium,168.35° E,-46.45° S
,Rio Tinto,Diavik Diamond Mine,Diamonds,110.30° W,64.50° N
,Rio Tinto,Iron Ore Company of Canada (IOC),Iron Ore,66.87° W,54.82° N
,Rio Tinto,Kennecott Copper,Copper-Gold-Silver-Molybdenum,112.13° W,40.63° N
,Rio Tinto,Resolution Copper (development),Copper-Molybdenum,110.77° W,33.28° N
,Rio Tinto,Boron,Borates,117.68° W,35.05° N
,Rio Tinto,Oyu Tolgoi,Copper-Gold-Silver,106.90° E,43.00° S
,Rio Tinto,Richards Bay Minerals (RBM),Titanium-Zircon,32.40° E,-28.75° S
,Rio Tinto,QIT Madagascar Minerals (QMM),Ilmenite,47.20° E,-25.10° S
,Rio Tinto,Jadar (development),Lithium-Borates,19.23° E,44.47° N
4,Zijin Mining,Zijinshan Mine,Gold-Copper,116.80° E,25.10° N
,Zijin Mining,Shuguang Gold-Copper Mine,Gold-Copper,130.00° E,42.80° N
,Zijin Mining,Ashele Copper Mine,Copper-Zinc,87.30° E,47.90° N
,Zijin Mining,Duobaoshan Copper Mine,Copper-Molybdenum,125.70° E,49.60° N
,Zijin Mining,Julong Copper Mine,Copper,90.50° E,30.20° N
,Zijin Mining,Čukaru Peki Mine,Copper-Gold,22.00° E,44.10° N
,Zijin Mining,Bor Mine Complex,Copper-Gold,22.10° E,44.05° N
,Zijin Mining,Kamoa-Kakula Mine,Copper,25.50° E,-10.80° S
,Zijin Mining,Kolwezi Copper Mine,Copper-Cobalt,25.45° E,-10.70° S
,Zijin Mining,Buriticá Gold Mine,Gold,75.90° W,6.70° N
,Zijin Mining,Porgera Gold Mine,Gold-Silver,143.10° E,-5.40° S
,Zijin Mining,Rosebel Gold Mine,Gold,55.10° W,5.00° N
,Zijin Mining,Tres Quebradas (3Q) Project,Lithium,68.00° W,-26.00° S
5,Southern Copper,Toquepala Mine,Copper-Molybdenum,70.62° W,-17.18° S
,Southern Copper,Cuajone Mine,Copper-Molybdenum,70.73° W,-16.98° S
,Southern Copper,Tía María Project,Copper,71.85° W,-17.08° S
,Southern Copper,Buenavista del Cobre (Cananea),Copper-Molybdenum,110.30° W,31.00° N
,Southern Copper,La Caridad Mine,Copper-Molybdenum,109.58° W,30.27° N
6,Newmont,Boddington Mine,Gold-Copper,116.37° E,-32.73° S
,Newmont,Tanami Mine,Gold,129.72° E,-20.58° S
,Newmont,Cadia Valley Operations,Gold-Copper,149.00° E,-33.45° S
,Newmont,Telfer Mine,Gold-Copper,122.22° E,-21.72° S
,Newmont,Cripple Creek & Victor (CC&V),Gold,105.17° W,38.73° N
,Newmont,Carlin Trend,Gold,116.20° W,40.80° N
,Newmont,Turquoise Ridge,Gold,117.20° W,41.20° N
,Newmont,Phoenix Mine,Gold-Copper-Silver,116.90° W,40.50° N
,Newmont,Long Canyon,Gold,114.70° W,40.90° N
,Newmont,Peñasquito Mine,Gold-Silver-Lead-Zinc,101.50° W,24.10° N
,Newmont,Yanacocha Mine,Gold,78.50° W,-6.90° S
,Newmont,Merian Mine,Gold,54.40° W,4.60° N
,Newmont,Cerro Negro Mine,Gold-Silver,69.50° W,-47.00° S
,Newmont,Pueblo Viejo (40% JV),Gold-Silver-Copper,70.20° W,18.80° N
,Newmont,Ahafo Mine,Gold,2.30° W,7.00° N
,Newmont,Akyem Mine,Gold,1.00° W,6.40° N
,Newmont,Éléonore Mine,Gold,76.20° W,52.70° N
,Newmont,Porcupine Mine,Gold,81.30° W,48.50° N
,Newmont,Musselwhite Mine,Gold,90.20° W,52.50° N
7,Agnico Eagle Mines,LaRonde Complex,Gold-Zinc-Copper-Silver,78.20° W,48.20° N
,Agnico Eagle Mines,Goldex Mine,Gold,77.80° W,48.10° N
,Agnico Eagle Mines,Canadian Malartic (50% JV),Gold,78.10° W,48.10° N
,Agnico Eagle Mines,Detour Lake Mine,Gold,79.70° W,49.90° N
,Agnico Eagle Mines,Macassa Mine,Gold,80.00° W,48.10° N
,Agnico Eagle Mines,Meliadine Mine,Gold,92.10° W,63.00° N
,Agnico Eagle Mines,Meadowbank Complex,Gold,96.00° W,65.00° N
,Agnico Eagle Mines,Hope Bay,Gold,106.50° W,68.20° N
,Agnico Eagle Mines,Kittila Mine,Gold,25.30° E,67.70° N
,Agnico Eagle Mines,Pinos Altos Mine,Gold-Silver,108.30° W,28.00° N
,Agnico Eagle Mines,La India Mine,Gold-Silver,109.80° W,28.80° N
,Agnico Eagle Mines,Santa Gertrudis Project,Gold,110.00° W,30.50° N
,Agnico Eagle Mines,Fosterville Mine,Gold,144.70° E,-36.80° S
9,Grupo México,See Southern Copper (SCCO)
10,Freeport-McMoRan,Morenci Mine,Copper-Molybdenum,109.40° W,33.10° N
,Freeport-McMoRan,Bagdad Mine,Copper-Molybdenum,113.20° W,34.60° N
,Freeport-McMoRan,Safford Mine,Copper,109.60° W,32.90° N
,Freeport-McMoRan,Sierrita Mine,Copper-Molybdenum,111.10° W,31.90° N
,Freeport-McMoRan,Miami Mine,Copper,110.90° W,33.40° N
,Freeport-McMoRan,Chino Mine,Copper-Molybdenum,108.10° W,32.80° N
,Freeport-McMoRan,Tyrone Mine,Copper,108.30° W,32.60° N
,Freeport-McMoRan,El Abra Mine (51% JV),Copper,68.80° W,-21.50° S
,Freeport-McMoRan,Cerro Verde Mine (53.56% JV),Copper-Molybdenum,71.70° W,-16.50° S
,Freeport-McMoRan,Grasberg Mine,Copper-Gold-Silver,137.10° E,-4.10° S
11,Barrick Gold,Carlin Trend (NV Gold Mines JV),Gold,116.20° W,40.80° N
,Barrick Gold,Cortez Complex (NV Gold Mines JV),Gold,116.70° W,40.30° N
,Barrick Gold,Turquoise Ridge (NV Gold Mines JV),Gold,117.20° W,41.20° N
,Barrick Gold,Phoenix (NV Gold Mines JV),Gold-Copper-Silver,116.90° W,40.50° N
,Barrick Gold,Long Canyon (NV Gold Mines JV),Gold,114.70° W,40.90° N
,Barrick Gold,Pueblo Viejo (60% JV),Gold-Silver-Copper,70.20° W,18.80° N
,Barrick Gold,Veladero Mine (50% JV),Gold-Silver,69.90° W,-29.30° S
,Barrick Gold,Tongon Mine,Gold,5.50° W,9.80° N
,Barrick Gold,Loulo-Gounkoto Complex,Gold,11.00° W,12.70° N
,Barrick Gold,Kibali Mine (45% JV),Gold,29.50° E,2.80° N
,Barrick Gold,North Mara Mine,Gold,34.40° E,-1.50° S
,Barrick Gold,Bulyanhulu Mine,Gold,32.80° E,-3.20° S
,Barrick Gold,Lumwana Mine,Copper,25.80° E,-11.70° S
,Barrick Gold,Porgera Gold Mine (47.5% JV),Gold-Silver,143.10° E,-5.40° S
,Barrick Gold,Jabal Sayid (50% JV),Copper,40.10° E,23.80° N
12,Glencore,Mount Isa Mines,Copper-Lead-Zinc-Silver,139.50° E,-20.73° S
,Glencore,Ernest Henry Mining (Copper),Copper-Gold,140.58° E,-20.52° S
,Glencore,McArthur River Mine (MRM),Zinc-Lead-Silver,136.08° E,-16.43° S
,Glencore,Murrin Murrin,Nickel-Cobalt,121.90° E,-28.65° S
,Glencore,Ulan Coal,Coal,149.73° E,-32.17° S
,Glencore,Rolleston Coal,Coal,148.58° E,-24.47° S
,Glencore,Collinsville Coal,Coal,147.83° E,-20.55° S
,Glencore,Newlands Coal,Coal,148.07° E,-21.22° S
,Glencore,Hail Creek Coal,Coal,148.38° E,-21.57° S
,Glencore,Raglan Mine,Nickel-Copper,73.67° W,61.70° N
,Glencore,Sudbury INO,Nickel-Copper-PGMs,81.02° W,46.47° N
,Glencore,Kidd Operations,Copper-Zinc,81.13° W,48.57° N
,Glencore,Brunswick Smelter,Lead-Silver,65.85° W,47.42° N
,Glencore,Antamina (33.75% JV),Copper-Zinc-Molybdenum-Silver,77.05° W,-9.53° S
,Glencore,Collahuasi (44% JV),Copper-Molybdenum,68.75° W,-20.97° S
,Glencore,Lomas Bayas,Copper,69.57° W,-23.47° S
,Glencore,Pachon (El Pachón),Copper-Molybdenum,70.43° W,-31.80° S
,Glencore,Katanga (Kamoto),Copper-Cobalt,25.40° E,-10.73° S
,Glencore,Mopani,Copper-Cobalt,28.40° E,-12.83° S
,Glencore,Prodeco (Cerrejón),Coal,72.60° W,11.10° N
,Glencore,Koniambo (49% JV),Nickel,165.20° E,-21.10° S
,Glencore,Various (Coal),Coal,Various,Various
13,Vale,Carajás Mine (Serra Sul/Norte),Iron Ore,50.50° W,-6.07° S
,Vale,S11D (Serra Sul),Iron Ore,50.30° W,-6.10° S
,Vale,Southeastern System (Itabira, etc.),Iron Ore,43.22° W,-19.62° S
,Vale,Southern System (Vargem Grande, etc.),Iron Ore,43.88° W,-20.08° S
,Vale,Sudbury Operations,Nickel-Copper-PGMs,81.02° W,46.47° N
,Vale,Thompson Operations,Nickel,97.88° W,55.75° N
,Vale,Voisey's Bay,Nickel-Copper-Cobalt,61.28° W,56.33° N
,Vale,Onça Puma,Nickel,50.93° W,-5.90° S
,Vale,Salobo (Salobo 3),Copper-Gold,50.53° W,-5.78° S
,Vale,Sossego,Copper-Gold,50.58° W,-5.92° S
,Vale,PT Vale Indonesia (PTVI),Nickel,121.33° E,-2.55° S
,Vale,Moatize (Sold),Coal,33.80° E,-16.15° S
1Toquepala,CMOC,Tenke Fungurume,Copper-Cobalt,26.20° E,-10.50° S
,CMOC,Kisanfu (95% JV),Copper-Cobalt,26.00° E,-10.80° S
,CMOC,Sandaozhuang Mine (Luoyang),Molybdenum-Tungsten,111.80° E,34.50° N
,CMOC,Northparkes (80% JV),Copper-Gold,148.23° E,-33.07° S
,CMOC,Crixás Mine (IX) (JV w/ AngloGold),Gold,49.98° W,-14.50° S
,CMOC,Niobium (Copebrás),Niobium-Phosphates,48.60° W,-18.40° S
,CMOC,Phosphates (Copebrás),Phosphates,48.60° W,-18.40° S
16,Fortescue,Eliwana Mine,Iron Ore,116.50° E,-23.00° S
,Fortescue,Solomon Hub (Firetail, Kings),Iron Ore,117.50° E,-22.30° S
,Fortescue,Cloudbreak,Iron Ore,118.00° E,-22.60° S
,Fortescue,Christmas Creek,Iron Ore,118.30° E,-22.70° S
,Fortescue,Iron Bridge (Magnetite),Iron Ore,118.70° E,-21.60° S
17,Anglo American,Mogalakwena,PGMs-Nickel-Copper,29.00° E,-24.00° S
,Anglo American,Amandelbult,PGMs,27.20° E,-24.70° S
,Anglo American,Mototolo,PGMs,29.70° E,-24.80° S
,Anglo American,Unki,PGMs,30.00° E,-19.60° S
,Anglo American,Venetia,Diamonds,29.30° E,-22.40° S
,Anglo American,Jwaneng (Debswana JV),Diamonds,24.70° E,-24.50° S
,Anglo American,Orapa (Debswana JV),Diamonds,25.30° E,-21.30° S
,Anglo American,Sishen (Kumba Iron Ore),Iron Ore,23.00° E,-27.70° S
,Anglo American,Kolomela (Kumba Iron Ore),Iron Ore,22.60° E,-28.30° S
,Anglo American,Kumba Iron Ore (Thabazimbi),Iron Ore,27.40° E,-24.60° S
,Anglo American,Goedehoop,Coal,29.20° E,-26.10° S
,Anglo American,Greenside,Coal,29.30° E,-26.00° S
,Anglo American,Khwezela,Coal,29.40° E,-26.00° S
,Anglo American,Zibulo,Coal,29.50° E,-26.10° S
,Anglo American,Los Bronces,Copper,70.30° W,-33.10° S
,Anglo American,Collahuasi (44% JV),Copper,68.75° W,-20.97° S
,Anglo American,El Soldado,Copper,71.10° W,-32.70° S
,Anglo American,Chagres Smelter,Copper,70.60° W,-32.80° S
,Anglo American,Quellaveco,Copper,70.50° W,-17.00° S
,Anglo American,Barro Alto,Nickel,48.80° W,-14.80° S
,Anglo American,Codemin,Nickel,48.70° W,-14.80° S
,Anglo American,Moranbah North (JV),Coal (Metallurgical),148.10° E,-22.00° S
,Anglo American,Grosvenor (JV),Coal (Metallurgical),148.10° E,-22.00° S
,Anglo American,Capcoal (JV),Coal (Metallurgical),148.20° E,-22.70° S
Remember,Anglo American,Dawson (JV),Coal (Metallurgical),150.00° E,-25.10° S
,Anglo American,Jellinbah East (JV),Coal (Metallurgical),149.30° E,-23.50° S
18,Cameco,McArthur River,Uranium,105.05° W,57.76° N
,Cameco,Cigar Lake,Uranium,104.54° W,58.07° N
,Cameco,Key Lake Mill,Uranium,105.60° W,57.22° N
,Cameco,Rabbit Lake,Uranium,103.70° W,58.20° N
,Cameco,Inkola (JV),Uranium,69.50° E,44.70° N
,Cameco,Smith Ranch-Highland,Uranium,105.50° W,43.20° N
,Cameco,Crow Butte,Uranium,103.10° W,42.80° N
19,Franco-Nevada,Various (Royalty/Stream),Gold-Silver-PGMs-Oil-Gas,Various,Various
20,Bayan Resources,Tabang / Wahana,Coal,116.50° E,-0.50° S
,Bayan Resources,Pakar,Coal,116.60° E,-0.60° S
,Bayan Resources,Teguh Sinar Abadi / Firman Ketaun,Coal,116.70° E,-0.70° S
21,Gold Fields,South Deep,Gold,27.60° E,-26.40° S
,Gold Fields,Tarkwa,Gold,1.90° W,5.30° N
,Gold Fields,Damang,Gold,1.90° W,5.50° N
,Gold Fields,Gruyere (50% JV),Gold,123.80° E,-27.90° S
,Gold Fields,St Ives,Gold,121.30° E,-31.20° S
,Gold Fields,Agnew,Gold,120.70° E,-27.90° S
,Gold Fields,Cerro Corona,Gold-Copper,78.20° W,-6.70° S
,Gold Fields,Salares Norte,Gold-Silver,69.10° W,-25.90° S
22,Antofagasta,Los Pelambres,Copper-Molybdenum,70.50° W,-31.70° S
,Antofagasta,Centinela,Copper-Gold-Molybdenum,69.10° W,-22.60° S
,Antofagasta,Antucoya,Copper,69.30° W,-23.10° S
,Antofagasta,Zaldívar (50% JV),Copper,69.10° W,-24.10° S
23,Polyus,Olimpiada,Gold,92.90° E,60.10° N
,Polyus,Blagodatnoye,Gold,92.80° E,59.90° N
,Polyus,Verninskoye,Gold,114.70° E,59.30° N
Note,Polyus,Kuranakh,Gold,124.90° E,58.80° N
,Polyus,Natalka,Gold,150.80° E,62.50° N
,Polyus,Sukhoi Log (development),Gold,115.80° E,59.70° N
24,AngloGold Ashanti,Geita,Gold,32.20° E,-2.80° S
,AngloGold Ashanti,Obuasi,Gold,1.60° W,6.20° N
,AngloGold Ashanti,Iduapriem,Gold,2.00° W,5.30° N
Siguiri,Gold,9.10° W,11.40° N
,AngloGold Ashanti,Sunrise Dam,Gold,122.40° E,-30.50° S
,AngloGold Ashanti,Tropicana (70% JV),Gold,124.70° E,-29.30° S
,AngloGold Ashanti,Cerro Vanguardia (92.5% JV),Gold-Silver,68.30° W,-48.50° S
,AngloGold Ashanti,Serra Grande,Gold,50.10° W,-14.40° S
,AngloGold Ashanti,AGA Mineração,Gold,43.50° W,-20.10° S
,AngloGold Ashanti,Quebradona (development),Copper-Gold,75.60° W,5.80° N
25,Kinross Gold,Tasiast,Gold,15.00° W,20.50° N
,Kinross Gold,Paracatu,Gold,46.80° W,-17.20° S
,Kinross Gold,Round Mountain (75% JV),Gold,117.10° W,38.70° N
,Kinross Gold,Fort Knox,Gold,147.30° W,64.90° N
,Kinross Gold,Bald Mountain (75% JV),Gold,115.90° W,40.60° N
,Kinross Gold,Kupol,Gold-Silver,169.70° E,66.60° N
,Kinross Gold,Dvoinoye,Gold,169.80° E,67.00° N
,Kinross Gold,Great Bear (development),Gold,92.50° W,50.80° N
26,Nutrien,Cory,Potash,106.80° W,52.00° N
,Nutrien,Allan,Potash,106.20° W,51.80° N
,Nutrien,Lanigan,Potash,105.10° W,51.80° N
,Nutrien,Patience Lake,Potash,106.30° W,52.00° N
,Nutrien,Rocanville,Potash,101.60° W,50.40° N
,Nutrien,Vanscoy,Potash,107.00° W,51.90° N
,Nutrien,Aurora,Phosphates,76.80° W,35.30° N
,Nutrien,White Springs,Phosphates,82.70° W,30.30° N
,Nutrien,Geismar,Nitrogen/Phosphates,91.00° W,30.20° N
27,Coal India,Gevra,Coal,82.50° E,22.30° N
,Coal India,Kusmunda,Coal,82.70° E,22.40° N
,Coal India,Dipka,Coal,82.60° E,22.40° N
,Coal India,Jayant,Coal,82.60° E,24.10° N
,Coal India,Dudhichua,Coal,82.70° E,24.10° N
,Coal India,Amlohri,Coal,82.70° E,24.10° N
,Coal India,Nigahi,Coal,82.80° E,24.10° N
,Coal India,Magadh,Coal,84.40° E,23.70° N
,Coal India,Rajmahal,Coal,87.30° E,25.00° N
,Coal India,Raniganj,Coal,87.10° E,23.60° N
,Coal India,Jharia,Coal,86.40° E,23.70° N
,Coal India,Bokaro,Coal,85.80° E,23.70° N
,Coal India,Karanpura,Coal,85.20° E,23.60° N
,Coal India,Talcher,Coal,85.20° E,20.90° N
,Coal India,Ib Valley,Coal,83.90° E,21.80° N
28,China Northern Rare Earth,Bayan Obo,Rare Earths-Niobium-Iron,109.97° E,41.78° N
29,Nornickel,Norilsk-Talnakh,Nickel-Copper-PGMs,88.20° E,69.40° N
Adjust,Nornickel,Kola (Monchegorsk),Nickel-Copper-PGMs,32.80° E,67.90° N
,Nornickel,Bystrinskoye,Copper-Iron-Gold,114.50° E,51.10° N
30,Shandong Gold Mining,Jiaojia Gold Mine,Gold,120.00° E,37.60° N
,Shandong Gold Mining,Sanshandao Gold Mine,Gold,120.10° E,37.70° N
,Shandong Gold Mining,Xincheng Gold Mine,Gold,120.20° E,37.60° N
,Shandong Gold Mining,Linglong Gold Mine,Gold,120.30° E,37.50° N
,Shandong Gold Mining,Veladero Mine (50% JV),Gold-Silver,69.90° W,-29.30° S
,Shandong Gold Mining,Namdini Gold Project,Gold,0.80° W,10.70° N
31,China Coal Energy,Pingshuo (Antaibao),Coal,112.40° E,39.50° N
,China Coal Energy,Anjialing,Coal,112.50° E,39.50° N
,China Coal Energy,Dongpo,Coal,112.60° E,39.50° N
,China Coal Energy,Huojitu,Coal,110.00° E,39.40° N
,China Coal Energy,Nalinhe,Coal,109.80° E,39.20° N
,China Coal Energy,Menkeqing,Coal,109.70° E,39.10° N
32,Northern Star,Jundee Operations,Gold,121.10° E,-26.80° S
,Northern Star,Bronzewing,Gold,121.20° E,-27.10° S
,Northern Star,Kalgoorlie Ops (KCGM JV),Gold,121.50° E,-30.78° S
,Northern Star,Carosue Dam,Gold,122.30° E,-30.10° S
,Northern Star,Pogo Mine,Gold,143.20° W,64.80° N
,Northern Star,Kundana,Gold,121.30° E,-30.60° S
,Northern Star,Kanowna Belle,Gold,121.60° E,-30.60° S
,Northern Star,Millennium,Gold,121.30° E,-30.70° S
33,Vedanta,Rampura Agucha,Zinc-Lead-Silver,74.70° E,25.80° S
,Vedanta,Sindesar Khurd,Zinc-Lead-Silver,74.20° E,25.10° S
,Vedanta,Dariba,Zinc-Lead-Silver,74.10° E,24.90° S
,Vedanta,Zawar,Zinc-Lead-Silver,73.70° E,24.30° S
,Vedanta,Konkola (KCM),Copper,28.40° E,-12.80° S
,Vedanta,Black Mountain (BMM),Zinc-Lead-Copper-Silver,18.80° E,-29.20° S
,Vedanta,Gamsberg (BMM),Zinc,18.80° E,-29.20° S
Lost,Vedanta,Lisheen (Closed),Zinc-Lead,7.60° W,52.70° N
,Vedanta,Goa Iron Ore (Sesa Goa),Iron Ore,73.90° E,15.40° N
,Vedanta,Karnataka Iron Ore (Sesa Goa),Iron Ore,76.50° E,15.10° N
,Vedanta,Lanjigarh (Alumina),Alumina,83.30° E,19.80° N
,Vedanta,Jharsuguda (Aluminium),Aluminium,84.00° E,21.80° N
,Vedanta,BALCO (Aluminium),Aluminium,82.20° E,22.30° N
34,Fresnillo,Fresnillo (Mine),Silver-Gold-Lead-Zinc,102.80° W,23.20° N
,Fresnillo,Saucito,Silver-Gold-Lead-Zinc,102.80° W,23.10° N
,Fresnillo,Ciénega,Gold-Silver,105.10° W,24.80° N
,Fresnillo,Herradura,Gold,112.30° W,31.50° N
,Fresnillo,Noche Buena,Gold,112.20° W,31.40° N
Read,Fresnillo,San Julián,Silver-Gold,105.80° W,25.80° N
,Fresnillo,Juanicipio (56% JV),Silver-Gold,103.00° W,23.10° N
35,Teck Resources,Highland Valley Copper,Copper-Molybdenum,121.00° W,50.40° N
,Teck Resources,Trail Operations,Lead-Zinc-Silver,117.70° W,49.10° N
,Teck Resources,Red Dog Mine,Zinc-Lead,162.80° W,68.00° N
,Teck Resources,Antamina (22.5% JV),Copper-Zinc-Molybdenum,77.05° W,-9.53° S
,Teck Resources,Carmen de Andacollo,Copper,71.00° W,-30.20° S
,Teck Resources,Quebrada Blanca (QB2),Copper,69.50° W,-21.00° S
,Teck Resources,Elkview,Coal (Metallurgical),114.90° W,49.70° N
,Teck Resources,Fording River,Coal (Metallurgical),114.80° W,50.20° N
,Teck Resources,Greenhills,Coal (Metallurgical),114.90° W,49.80° N
,Teck Resources,Line Creek,Coal (Metallurgical),114.90° W,49.90° N
,Teck Resources,Cardinal River,Coal (Metallurgical),116.80° W,53.00° N
36,Yankuang Energy,Jining II,Coal,116.60° E,35.40° N
,Yankuang Energy,Jining III,Coal,116.70° E,35.40° N
Remember,Yankuang Energy,Baodian,Coal,116.80° E,35.50° N
,Yankuang Energy,Nantun,Coal,116.90° E,35.50° N
,Yankuang Energy,Shandong,Coal,117.00° E,35.50° N
,Yankuang Energy,Ordos (Yilan),Coal,109.70° E,39.60° N
,Yankuang Energy,Yancoal Australia (YAL) (Various),Coal,Various,Various
37,First Quantum Minerals,Kansanshi,Copper-Gold,26.40° E,-12.00° S
,First Quantum Minerals,Sentinel,Copper,25.50° E,-12.20° S
,First Quantum Minerals,Cobre Panama,Copper-Gold-Silver,80.70° W,8.80° N
,First Quantum Minerals,Guelb Moghrein,Copper-Gold,14.00° W,17.40° N
,First Quantum Minerals,Çayeli,Copper-Zinc,40.70° E,41.00° N
,First Quantum Minerals,Las Cruces,Copper,5.90° W,37.50° N
,First Quantum Minerals,Pyhäsalmi (Closed),Copper-Zinc,25.90° E,63.60° N
,First Quantum Minerals,Ravensthorpe,Nickel-Cobalt,120.20° E,-33.60° S
38,Ganfeng Lithium,Mt Marion (50% JV),Lithium (Spodumene),121.40° E,-30.90° S
,Ganfeng Lithium,Cauchari-Olaroz (51% JV),Lithium (Brine),66.60° W,-23.60° S
,Ganfeng Lithium,Mariana,Lithium (Brine),66.60° W,-25.60° S
,Ganfeng Lithium,Sonora (Project),Lithium (Clay),110.00° W,29.80° N
,Ganfeng Lithium,Goulamina (Project),Lithium (Spodumene),7.90° W,11.80° N
39,Zhejiang Huayou Cobalt,PEA (JV),Copper-Cobalt,25.90° E,-10.90° S
,Zhejiang Huayou Cobalt,Ruashi,Copper-Cobalt,27.50° E,-11.60° S
,Zhejiang Huayou Cobalt,Luiswishi,Copper-Cobalt,27.50° E,-11.50° S
,Zhejiang Huayou Cobalt,Arcadia (Project),Lithium,31.30° E,-17.70° S
40,Lundin Gold,Fruta del Norte,Gold-Silver,78.60° W,-3.60° S
41,Industrias Peñoles,Fresnillo (see FNLPF),Silver-Gold,102.80° W,23.20° N
,Industrias Peñoles,Saucito (see FNLPF),Silver-Gold,102.80° W,23.10° N
,Industrias Peñoles,Ciénega (see FNLPF),Gold-Silver,105.10° W,24.80° N
,Industrias Peñoles,San Julián (see FNLPF),Silver-Gold,105.80° W,25.80° N
,Industrias Peñoles,Bismark,Zinc-Lead-Copper,107.00° W,28.70° N
,Industrias Peñoles,Madero,Zinc-Lead-Copper,102.70° W,23.10° N
Remember,Industrias Peñoles,Sabinas,Zinc-Lead-Copper,102.90° W,23.30° N
,Industrias Peñoles,Velardeña,Zinc-Lead-Copper,104.20° W,24.80° N
,Industrias Peñoles,Tizapa (JV),Zinc-Lead-Copper,99.90° W,18.70° N
,Industrias Peñoles,Capela,Zinc-Lead-Copper,103.50° W,24.00° N
,Industrias Peñoles,Met-Mex Peñoles (Smelter),Lead-Zinc-Silver-Gold,103.40° W,25.50° N
42,Royal Gold,Various (Royalty/Stream),Gold-Silver-Copper,Various,Various
43,Zhongjin Gold,Inner Mongolia Mine,Gold,118.00° E,46.00° N
,Zhongjin Gold,Shaanxi Mine,Gold,109.00° E,34.00° N
,Zhongjin Gold,Jilin Mine,Gold,126.00° E,43.00° N
,Zhongjin Gold,Songxian Mine,Gold,112.00° E,33.00° N
44,Kazatomprom,Inkai (JV),Uranium,68.80° E,45.50° N
,Kazatomprom,Katco (JV),Uranium,69.00° E,45.00° N
,Kazatomprom,Budenovskoye (JV),Uranium,69.10° E,45.10° N
,Kazatomprom,Karatau (JV),Uranium,68.90° E,45.30° N
,Kazatomprom,South Inkai (JV),Uranium,68.90° E,45.40° N
,Kazatomprom,Torgai (JV),Uranium,67.50° E,46.20° N
4Good,Pan American Silver,La Colorada,Silver-Gold,102.80° W,23.00° N
,Pan American Silver,Dolores,Silver-Gold,108.40° W,28.00° N
,Pan American Silver,Huaron,Silver-Lead-Zinc,76.40° W,-11.00° S
,Pan American Silver,Morococha,Silver-Lead-Zinc,76.10° W,-11.60° S
,Pan American Silver,San Vicente,Silver-Zinc,66.30° W,-21.30° S
,Pan American Silver,Manantial Espejo (Closed),Silver-Gold,69.00° W,-48.80° S
,Pan American Silver,Timmins West,Gold,81.40° W,48.50° N
,Pan American Silver,Bell Creek,Gold,81.20° W,48.50° N
,Pan American Silver,Shahuindo,Gold,78.30° W,-7.00° S
,Pan American Silver,La Arena,Gold,78.20° W,-7.80° S
,Pan American Silver,Escobal,Silver,90.40° W,14.40° N
46,Ivanhoe Mines,Kamoa-Kakula (JV),Copper,25.50° E,-10.80° S
,Ivanhoe Mines,Kipushi (JV),Zinc-Copper,27.30° E,-11.70° S
,Ivanhoe Mines,Platreef (Project),PGMs-Nickel-Copper,29.00° E,-24.00° S
,Ivanhoe Mines,Western Foreland (Project),Copper,25.00° E,-11.00° S
47,Evolution Mining,Cowal Operation,Gold,147.367° E,33.650° S
,Evolution Mining,Northparkes Mine,"Copper, Gold",148.233° E,33.067° S
,Evolution Mining,Ernest Henry Mine,"Copper, Gold",140.583° E,20.517° S
,Evolution Mining,Mt Rawdon Mine,Gold,151.917° E,25.083° S
,Evolution Mining,Mungari Operation,Gold,121.281° E,30.906° S
,Evolution Mining,Red Lake Mine,Gold,93.800° W,51.067° N
48,Zhaojin Mining Industry Company,Dayingezhuang Gold Mine,Gold,120.45° E,37.58° N
,Zhaojin Mining Industry Company,Xiadian Gold Mine,Gold,120.20° E,37.25° N
,Zhaojin Mining Industry Company,Jinchiling Gold Mine,Gold,120.30° E,37.50° N
,Zhaojin Mining Industry Company,Zaozigou Gold Mine,Gold,102.90° E,34.90° N
,Zhaojin Mining Industry Company,Haiyu Gold Mine,Gold,120.15° E,37.70° N
,Zhaojin Mining Industry Company,Abujar Gold Mine,Gold,6.00° W,6.80° N
49,Alamos Gold,Young-Davidson Mine,Gold,80.60° W,47.90° N
,Alamos Gold,Island Gold Mine,Gold,84.80° W,48.60° N
,Alamos Gold,Mulatos Mine,Gold,108.70° W,28.70° N
,Alamos Gold,Lynn Lake (Project),Gold,101.10° W,56.90° N
50,Metso,N/A (Services/Technology),N/A,N/A,N/A
`;

const commodityColors = {
    // --- BLUE/CYAN FOCUS (8 SHADES) ---
    'Copper': '#4169E1',     // Royal Blue
    'Nickel': '#191970',     // Midnight Blue
    'Lithium': '#00CCFF',    // Neon Blue
    'Zinc': '#00FFFF',       // Pure Cyan
    'Cobalt': '#0000FF',     // Pure Blue
    'Diamonds': '#B9F2FF',   // Light Blue
    'Titanium': '#87CEEB',   // Sky Blue
    'Lead': '#3399FF',       // Azure Blue

    // --- GREEN/NEON FOCUS (4 SHADES) ---
    'Uranium': '#66FF66',    // Lime Green
    'Molybdenum': '#00FF33', // Electric Green
    'Bauxite': '#00FFCC',    // Neon Green
    'default': '#00FF7F',    // Spring Green

    // --- YELLOW/GOLD (2 SHADES) ---
    'Gold': '#FFD700',       // Bright Gold
    'Potash': '#CFB53B',     // NEW: Old Gold (was Classic Bronze)

    // --- METALLIC/EARTH/OTHER VIBRANT COLORS ---
    'Iron Ore': '#654321',   // Dark Brown

    // --- SILVER/PLATINUM TONES (4 SHADES) ---
    'Silver': '#C0C0C0',     // Classic Silver
    'Aluminium': '#A9B2B7',  // NEW: Bright Aluminum (was Light Gray)
    'PGMs': '#EEEEEE',       // NEW: Bright Platinum (was Near White)

    // --- NEUTRAL/NEAR WHITE TONES (3 SHADES) ---
    'Coal': '#333333',       // Dark Gray
    'Ilmenite': '#2F4F4F',   // Dark Slate Gray
    'Zircon': '#E6E0D4',     // Parchment/Off-White
    'Borates': '#F8F8F8',    // Near White
};
