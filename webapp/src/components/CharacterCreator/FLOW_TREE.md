# Drzewo decyzyjne Kreatora Postaci (Neural Identity Forge)

Poniżej znajduje się schemat przepływu (flow) kreatora, który budujemy. Opiera się on na Twoich zrzutach ekranu i opisie.

```mermaid
graph TD
    Start([Start Kreatora]) --> Step1
    
    subgraph "Etap 1: Fundamenty"
    Step1[Krok 1: Płeć / Gender]
    Step1 -->|Wybór| Step2[Krok 2: Styl / Style]
    end

    subgraph "Etap 2: Fizyczność"
    Step2 -->|Realistyczny/Anime| Step3[Krok 3: Cechy Fizyczne / Physics]
    Step3 --> Step3a[Etniczność]
    Step3 --> Step3b[Wiek 18-70]
    Step3 --> Step3c[Kolor Oczu]
    
    Step3 --> Step4[Krok 4: Włosy / Hair]
    Step4 --> Step4a[Długość: Short, Medium, Long]
    Step4 --> Step4b[Rodzaj: Straight, Wavy, Curly, Kinky]
    Step4 --> Step4c[Kolor: Blonde, Brown, Black, Red, etc.]
    
    Step4 --> Step5[Krok 5: Ciało / Body]
    Step5 -->|Male| Step5M[Typ: Slim, Muscular, Wide]
    Step5 -->|Female| Step5F[Typ: Skinny, Athletic, Average, Curvy, BBW]
    Step5F --> Step5F_Breast[Biust: Small, Medium, Large, Extra Large]
    
    Step10 --> End([Gotowa Postać])
    end
```

## Szczegółowy opis kroków:

1.  **Gender (Płeć)**: Kobieta / Mężczyzna (Zrobione ✅)
2.  **Style (Styl)**: Realistyczny / Anime (Zrobione ✅)
3.  **Physics (Cechy)**: (Zrobione ✅)
    *   Etniczność: Caucasian, Latino, Asian, Arab, Black/Afro
    *   Wiek: Suwak 18-70
    *   Oczy: Brown, Blue, Green
4.  **Hair (Włosy)**: (W trakcie...)
    *   Style: Buzz cut, Long, Slicked Back, Short, Bun, Dreadlocks, Curly, Bald, Afro
    *   Kolory: Blonde, Brown, Black, Ginger, Gray, White, Pink
5.  **Body (Ciało)**:
    *   Typy: Slim, Muscular, Wide
6.  **Personality (Osobowość)**:
    *   Archetypy: Protector, Sage, Hero, Jester, Toy Boy, Dominant, Submissive, Lover, Beast, Confidant, Rebel, Scholar
    *   Głos: Voice 1-9
7.  **Pose (Poza)**: Wybór pozycji postaci.
8.  **Outfit (Ubiór)**: Wybór ubrania.
9.  **Location (Miejsce)**: Tło/Otoczenie.
10. **Summary (Podsumowanie)**: Podgląd i generacja.

Czy ten plan zgadza się z Twoją wizją? Jeśli tak, przechodzę do kodowania Kroku 4 (Włosy).
