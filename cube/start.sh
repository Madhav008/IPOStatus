docker build -t ipo-landing .

docker run --rm -d --name ipo-landing-container -p 8341:80 ipo-landing