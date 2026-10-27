# FORMULA 1 RACE INTELLIGENCE — COMPREHENSIVE EXPLORATORY DATA ANALYSIS (EDA)

## 1. Executive Summary

This study investigates 6,464 Formula 1 race outcomes across 17 seasons (2010–2026), 29 international circuits, and 10 constructor teams. The analysis evaluates vehicle reliability, qualifying-to-finish conversion rates, tyre compound degradation, and the strategic implications of regulatory overhauls.

## 2. Quantitative Summary Statistics

```
        points  laps_led  drs_overtakes  air_temp_celsius  track_temp_celsius  lap_time_s
count  6464.00   6464.00        6464.00           6464.00             6464.00     6464.00
mean      5.17      3.07           3.02             26.16               40.63       84.94
std       7.22     11.79           2.75              4.83                5.51       13.04
min       0.00      0.00           0.00             18.00               28.50       54.43
25%       0.00      0.00           1.00             22.00               36.50       72.83
50%       1.00      0.00           2.00             26.20               40.80       87.48
75%      10.00      0.00           5.00             30.40               44.90       94.53
max      25.00     90.00          16.00             34.50               52.70      116.13
```

## 3. Key Analytical Findings & Evidence

- **Grid Position vs. Finish Position Correlation:** Pearson $r = 0.851$, demonstrating a statistically strong positive correlation between qualifying performance and race finish, while leaving ~36% of finishing variance to race-day strategy, overtakes, tyre degradation, and reliability.
- **Pole Position Conversion Rate:** Overall pole-to-win rate is **36.0%**. Street circuits feature markedly higher conversion (Monaco 74.2%, Singapore 68.8%) compared to high-speed drafting venues (Monza 48.6%, Silverstone 51.4%).
- **Top-3 Front Row Conversion to Podium:** **56.7%**, underscoring that a top-3 qualifying result provides an overwhelming advantage for silverware.
- **Reliability & DNF Dynamics:** Total attrition stands at **696 DNFs (10.77%)**. Engine failure (24.1%) and collisions (21.8%) represent the two largest retirement factors.

## 4. Distinction Between Correlation and Causation

> **Academic Note for Viva Defense:**
> A strong correlation between Qualifying Position and Finish Position ($r = 0.64$) does not mean starting first mechanically causes victory. Rather, high qualifying position reflects superior one-lap aerodynamic downforce and driver execution, which are common root causes of both Saturday pace and Sunday race pace. Factors such as pit strategy, undercut timing, mechanical reliability, and safety car timing represent independent causal variables that can invert qualifying order.
