# clear & create dist folder
if [ -d "dist" ]; then
    rm -rf dist
    mkdir dist
else
    mkdir dist
fi

# compile js & scss
Uglifyjs2 js/RSmenu.js -o dist/RSmenu.min.js
compass compile -e production --force

# rename dist/*.css to dist/*.min.css
for file in dist/*; do
    if echo $file | grep -q .css && ! echo $file | grep -q .min.css; then
        replace=$(echo $file | sed -e "s/.css/.min.css/g")
        mv $file $replace
    fi
done