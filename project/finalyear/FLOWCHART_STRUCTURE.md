# Geospatial Protest Monitoring System - Flowchart Structure
## Complete Process Flow Diagram

### **MAIN SYSTEM FLOWCHART**

```mermaid
graph TD
    %% Data Input Layer
    A[Social Media APIs] --> B{Data Collection Gateway}
    C[PostGIS Database] --> B
    D[Web Scraping Modules] --> B
    E[Real-time Feeds] --> B
    
    %% Data Processing Hub
    B --> F[Data Validation & Cleaning]
    F --> G{Data Type Router}
    
    %% Data Type Routing
    G -->|Hashtag Data| H[Social Media Processor]
    G -->|Geospatial Data| I[Spatial Data Processor]
    G -->|Event Data| J[Event Data Processor]
    
    %% Social Media Pipeline
    H --> K[Trend Detection Algorithm]
    K --> L{Trend Score > 70?}
    L -->|Yes| M[Generate Alert]
    L -->|No| N[Store Trend Data]
    M --> O[Alert Management System]
    N --> P[Trend Analysis API]
    
    %% Spatial Analysis Pipeline
    I --> Q[Coordinate Extraction]
    Q --> R[KDE Analysis Engine]
    R --> S[Police Proximity Calculator]
    S --> T[Risk Surface Generator]
    T --> U{Hotspots Detected?}
    U -->|Yes| V[Hotspot Identification]
    U -->|No| W[Standard Analysis]
    V --> X[Risk Assessment Module]
    W --> X
    
    %% Event Processing Pipeline
    J --> Y[Protest Event Analyzer]
    Y --> Z[Ward Assignment Module]
    Z --> AA[Intensity Calculator]
    AA --> X
    
    %% Risk Assessment & Correlation
    X --> BB[Multi-Factor Risk Scoring]
    BB --> CC[Correlation Analysis Engine]
    CC --> DD{Correlation > 0.5?}
    DD -->|Yes| EE[Significant Correlation Found]
    DD -->|No| FF[Weak Correlation]
    EE --> GG[Statistical Summary Generator]
    FF --> GG
    
    %% Output & API Layer
    GG --> HH[API Response Builder]
    HH --> II{API Endpoint}
    
    %% API Endpoints
    II -->|/trending-hashtags/| JJ[Hashtag Trends API]
    II -->|/spatial-analysis/| KK[Spatial Analysis API]
    II -->|/ward-statistics/| LL[Statistics API]
    II -->|/merged-wards/| MM[Ward Data API]
    II -->|/protest-events/| NN[Event Data API]
    II -->|/police-stations/| OO[Police Data API]
    II -->|/nairobi-hospitals/| PP[Hospital Data API]
    II -->|/nairobi-roads/| QQ[Roads Data API]
    
    %% Integration Layer
    JJ --> RR[Frontend Dashboard]
    KK --> RR
    LL --> RR
    MM --> RR
    NN --> RR
    OO --> RR
    PP --> RR
    QQ --> RR
    
    %% Alert & Response System
    O --> SS[Mobile Alert System]
    O --> TT[Emergency Response]
    O --> UU[Policy Dashboard]
    
    %% External Integrations
    RR --> VV[GIS Applications]
    RR --> WW[Research Platforms]
    RR --> XX[Government Systems]
    
    %% Feedback Loop
    SS --> YY[Response Tracking]
    TT --> YY
    UU --> YY
    YY --> ZZ[System Learning Module]
    ZZ --> K
    ZZ --> R
    ZZ --> BB
```

### **DETAILED SUB-PROCESS FLOWCHARTS**

#### **1. Social Media Monitoring Sub-Process**

```mermaid
graph TD
    A[Start Social Media Monitor] --> B[Initialize Web Scrapers]
    B --> C{Platform Selection}
    
    C -->|Twitter/X| D[Twitter Scraper]
    C -->|Instagram| E[Instagram Scraper]
    C -->|TikTok| F[TikTok Scraper]
    C -->|Google Trends| G[Google Trends API]
    
    D --> H[Extract Hashtags]
    E --> H
    F --> H
    G --> H
    
    H --> I[Apply Kenya Filter]
    I --> J[Protest Keyword Matching]
    J --> K{Match Found?}
    
    K -->|Yes| L[Calculate Trend Score]
    K -->|No| M[Discard Data]
    
    L --> N{Score > Alert Threshold?}
    N -->|Yes| O[Generate High Priority Alert]
    N -->|No| P[Store Normal Trend]
    
    O --> Q[Send to Alert System]
    P --> R[Update Trend Database]
    Q --> S[API Response Ready]
    R --> S
    
    M --> T[Continue Monitoring]
    S --> T
```

#### **2. Spatial Analysis Sub-Process**

```mermaid
graph TD
    A[Start Spatial Analysis] --> B[Load Protest Events]
    B --> C[Load Police Stations]
    C --> D[Extract Coordinates]
    
    D --> E{KDE Requested?}
    E -->|Yes| F[Initialize KDE Parameters]
    E -->|No| G[Skip to Correlation]
    
    F --> H[Create Analysis Grid 50x50]
    H --> I[Apply Gaussian Kernel]
    I --> J[Generate Density Surface]
    
    J --> K[Calculate Police Distances]
    K --> L[Generate Proximity Weights]
    L --> M[Compute Risk Surface]
    M --> N[Identify Hotspots]
    
    N --> O{Hotspots Found?}
    O -->|Yes| P[Extract Hotspot Coordinates]
    O -->|No| Q[No Critical Areas]
    
    P --> R[Calculate Risk Scores]
    Q --> R
    G --> R
    
    R --> S[Start Correlation Analysis]
    S --> T[Select Ward Sample]
    T --> U[Calculate Protest Intensity]
    U --> V[Match Socioeconomic Data]
    
    V --> W{Valid Data Pairs?}
    W -->|Yes| X[Pearson Correlation]
    W -->|No| Y[Insufficient Data]
    
    X --> Z[Calculate P-Value]
    Z --> AA{Significant?}
    AA -->|Yes| BB[Strong Correlation Found]
    AA -->|No| CC[Weak Correlation]
    
    Y --> DD[Error Response]
    BB --> EE[Build Analysis Response]
    CC --> EE
    DD --> EE
```

#### **3. Risk Assessment Sub-Process**

```mermaid
graph TD
    A[Start Risk Assessment] --> B[Load Ward Data]
    B --> C{All Factors Available?}
    C -->|No| D[Mark as Unknown Risk]
    C -->|Yes| E[Initialize Risk Score]
    
    E --> F[Calculate Poverty Component]
    F --> G[Calculate Unemployment Component]
    G --> H[Calculate Housing Component]
    H --> I[Calculate Density Component]
    I --> J[Calculate Education Component]
    J --> K[Calculate Protest Component]
    
    K --> L[Sum All Components]
    L --> M[Divide by Factor Count]
    M --> N{Average Risk Score}
    
    N -->|< 3| O[Low Risk]
    N -->|3-6| P[Medium Risk]
    N -->|6-9| Q[High Risk]
    N -->|> 9| R[Critical Risk]
    
    O --> S[Risk Category Assigned]
    P --> S
    Q --> S
    R --> S
    D --> S
    
    S --> T[Update Ward Risk Status]
    T --> U[Generate Risk Distribution]
    U --> V[API Response Ready]
```

#### **4. API Request Flow**

```mermaid
graph TD
    A[HTTP Request Received] --> B{Authenticate Request?}
    B -->|Fail| C[Return 401 Unauthorized]
    B -->|Pass| D[Route to Endpoint]
    
    D --> E{Endpoint Type}
    
    E -->|/trending-hashtags/| F[Social Media Handler]
    E -->|/spatial-analysis/| G[Spatial Analysis Handler]
    E -->|/ward-statistics/| H[Statistics Handler]
    E -->|ViewSet Endpoints| I[CRUD Handler]
    
    F --> J[Execute Trend Analysis]
    G --> K[Execute Spatial Analysis]
    H --> L[Execute Statistics Calculation]
    I --> M[Execute Database Query]
    
    J --> N{Analysis Success?}
    K --> N
    L --> N
    M --> N
    
    N -->|Yes| O[Format Response Data]
    N -->|No| P[Generate Error Response]
    
    O --> Q[Apply Serialization]
    Q --> R[Add Metadata]
    R --> S[Return JSON Response]
    
    P --> T[Log Error Details]
    T --> U[Return Error JSON]
    
    C --> V[End Request]
    S --> V
    U --> V
```

### **DECISION TREE FOR ALERT GENERATION**

```mermaid
graph TD
    A[New Data Available] --> B{Data Source}
    
    B -->|Social Media| C[Check Trend Score]
    B -->|Spatial Analysis| D[Check Risk Level]
    B -->|Correlation Analysis| E[Check Correlation Strength]
    
    C --> F{Score > 70?}
    F -->|Yes| G[Medium Alert]
    F -->|No| H[No Alert]
    
    C --> I{Score > 85?}
    I -->|Yes| J[High Alert]
    I -->|No| G
    
    D --> K{Critical Risk Areas?}
    K -->|Yes| L[Spatial Alert]
    K -->|No| H
    
    E --> M{Correlation > 0.7?}
    M -->|Yes| N[Statistical Alert]
    M -->|No| H
    
    G --> O[Send to Alert System]
    J --> P[Send to Emergency Response]
    L --> O
    N --> O
    
    O --> Q[Notify Dashboard]
    P --> R[Notify Authorities]
    
    Q --> S[Update Alert Log]
    R --> S
    H --> T[Continue Monitoring]
    S --> T
```

### **DATA FLOW ARCHITECTURE**

```mermaid
graph LR
    subgraph "Input Layer"
        A[Twitter API]
        B[Web Scrapers]
        C[PostGIS DB]
        D[Manual Inputs]
    end
    
    subgraph "Processing Layer"
        E[Data Validation]
        F[Trend Analysis]
        G[Spatial Analysis]
        H[Risk Assessment]
        I[Correlation Engine]
    end
    
    subgraph "Storage Layer"
        J[Trend Cache]
        K[Spatial Cache]
        L[Risk Scores]
        M[Statistics Store]
    end
    
    subgraph "API Layer"
        N[REST Endpoints]
        O[Serialization]
        P[Response Formatting]
    end
    
    subgraph "Output Layer"
        Q[Dashboard]
        R[Mobile Apps]
        S[GIS Systems]
        T[Reports]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    E --> G
    E --> H
    E --> I
    
    F --> J
    G --> K
    H --> L
    I --> M
    
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O
    O --> P
    
    P --> Q
    P --> R
    P --> S
    P --> T
```

### **INTEGRATION POINTS FLOWCHART**

```mermaid
graph TD
    A[External Systems] --> B{Integration Type}
    
    B -->|Real-time| C[WebSocket Connections]
    B -->|Batch| D[Scheduled Jobs]
    B -->|API| E[REST API Calls]
    
    C --> F[Live Dashboard Updates]
    D --> G[Daily Statistical Reports]
    E --> H[Third-party Data Sync]
    
    F --> I[Frontend Components]
    G --> J[Report Generator]
    H --> K[Data Validation]
    
    I --> L[Map Visualizations]
    I --> M[Alert Panels]
    I --> N[Trend Charts]
    
    J --> O[PDF Reports]
    J --> P[Email Summaries]
    
    K --> Q{Data Valid?}
    Q -->|Yes| R[Update Database]
    Q -->|No| S[Error Handling]
    
    L --> T[User Interface]
    M --> T
    N --> T
    O --> U[Distribution System]
    P --> U
    
    R --> V[Success Response]
    S --> W[Error Response]
```

## **FLOWCHART USAGE GUIDE**

### **For Building Your Flowchart:**

1. **Start with the Main System Flowchart** - This shows the complete system overview
2. **Use Sub-Process Flowcharts** for detailed implementation of each component
3. **Include Decision Trees** for alert logic and routing
4. **Add Data Flow Architecture** to show system layers
5. **Integrate External Systems** using the integration points diagram

### **Flowchart Tools Recommendations:**

- **Mermaid.js**: For web-based diagrams (code provided above)
- **Lucidchart**: For professional flowcharts
- **Draw.io**: Free online diagramming tool
- **Microsoft Visio**: Enterprise-grade flowcharting
- **Figma**: For UI/UX focused flowcharts

### **Key Connection Points:**

1. **Data Input** → **Processing** → **Storage** → **API** → **Output**
2. **Social Media** → **Trend Detection** → **Alert Generation**
3. **Spatial Data** → **KDE Analysis** → **Risk Assessment** → **Hotspot Identification**
4. **Multiple Sources** → **Correlation Analysis** → **Statistical Insights**
5. **All Analyses** → **Unified Dashboard** → **Decision Support**

Copy the Mermaid diagrams above into any Mermaid-compatible tool to generate visual flowcharts, or use them as templates for other diagramming software!
