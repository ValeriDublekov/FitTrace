# Инструкции за настройка на Firebase (FitTrace)

Този проект използва Firebase за Authentication (Вход), Firestore (База данни) и Storage (Снимки). Следвайте стъпките по-долу, за да конфигурирате проекта си правилно.

## 1. Активиране на услугите в Firebase Console

Отидете в [Firebase Console](https://console.firebase.google.com/project/fittrace-app-366ee/overview) (уверете се, че сте влезли с профила **v.dublekov@gmail.com**).

Проектът ви е: **fittrace-app-366ee**

### Директни връзки:
- **База данни (Firestore):** [Кликнете тук](https://console.firebase.google.com/project/fittrace-app-366ee/firestore/databases/ai-studio-6be0d495-1c19-4e4f-b7e3-6dfef8b54845/data)
- **Потребители (Authentication):** [Кликнете тук](https://console.firebase.google.com/project/fittrace-app-366ee/authentication/users)
- **Файлове (Storage):** [Кликнете тук](https://console.firebase.google.com/project/fittrace-app-366ee/storage/fittrace-app-366ee.firebasestorage.app/files)

### А. Authentication
1. Отидете на **Build > Authentication**.
2. Кликнете на **Get Started**.
3. В таб **Sign-in method** изберете **Google** и го активирайте (Enable).
4. Настройте имейл за поддръжка на проекта и запазете.

### Б. Firestore Database
1. Отидете на **Build > Firestore Database**.
2. Кликнете на **Create database**.
3. Изберете локация (близо до вас) и стартирайте в **Production mode** (правилата вече са качени от мен).

### В. Firebase Storage (за снимки на упражнения)
1. Отидете на **Build > Storage**.
2. Кликнете на **Get Started**.
3. Кликнете на **Next** и след това на **Done**.
4. **Важно:** Трябва да добавите правила за Storage, за да позволяват качване. Отидете на таб **Rules** в Storage и заменете съдържанието с:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /exercises/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

---

## 2. Как да добавите Администратор (Admin Rights)

Системата проверява дали вашият уникален идентификатор (UID) съществува в специална колекция `admins` във Firestore.

### Стъпки за добавяне:
1. Влезте в приложението веднъж с вашия Google акаунт.
2. Отидете във Firebase Console > **Firestore Database**.
3. Кликнете на **Start collection**.
4. Име на колекцията: `admins`.
5. **Document ID:** Тук трябва да поставите вашия **User UID**.
   - Можете да намерите вашия UID в секция **Authentication > Users**.
6. Добавете следните полета в документа:
   - `email`: (стринг) вашият имейл.
   - `createdAt`: (timestamp) текущата дата.
7. Запазете документа.

След тези стъпки, когато презаредите приложението, в навигационната лента ще се появи меню **Admin**, което ще ви даде достъп до `/admin`.

---

## 3. Локална конфигурация
Ако разработвате локално, уверете се, че файлът `firebase-applet-config.json` в корена на проекта съдържа правилните ключове от "Project Settings > Your Apps" в конзолата на Firebase.
