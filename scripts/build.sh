yarn prisma &&
yarn proto &&
if [ "$1" = "prod" ]; then
    yarn clear
    yarn tsc --build tsconfig.prod.json
else
    yarn tsc
fi &&
# cp src/protobuf-gen/*.js out/protobuf-gen 
mkdir -p out/protobuf-gen && 
for file in src/protobuf-gen/*.js
    do cp "$file" out/protobuf-gen/
done