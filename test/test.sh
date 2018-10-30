 curl -vX POST http://127.0.0.1:3000/api/image -d @test2.json  --header "Content-Type: application/json" --output test.png
 curl -vX POST http://127.0.0.1:3000/api/video -d @test.json  --header "Content-Type: application/json"  --output test.webm
