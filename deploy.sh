cd src || exit
npm run build
cd ..

rm -rf ./docs
mkdir ./docs

cp -r ./src/public/. ./docs