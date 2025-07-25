FROM node:20-slim

# Git yüklü değil, yükleniyor
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Paketleri kopyala ve yükle
COPY package.json .
RUN npm install

# Geri kalan dosyaları kopyala
COPY . .

CMD ["node", "index.js"]