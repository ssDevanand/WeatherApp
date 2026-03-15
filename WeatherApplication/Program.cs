
using RestSharp;
// using System.Text.Json;
using System.Text.Json.Nodes;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


// Add CORS for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeatherUiApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var apiKey = "tOCBUg4HH1pFy0tAJqcVgcgDSqbjCA0K";

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast/{city}", async (string city) =>
{

List<object> finalArray = [];
List<string> dateList = new List<string>();
var finalObject = new JsonObject();

var options = new RestClientOptions($"https://api.tomorrow.io/v4/weather/forecast?location={city}&apikey={apiKey}");
var client = new RestClient(options);
var request = new RestRequest("");
request.AddHeader("accept-encoding", "deflate, gzip, br");
request.AddHeader("accept", "application/json");
var response = await client.GetAsync(request);

// 1. Parse the raw string into a readable JSON node
var jsonResponse = JsonNode.Parse(response.Content);

// Console.WriteLine("{0}", jsonResponse["timelines"]["daily"].AsArray().Length);

    var forecast = jsonResponse["timelines"]["daily"];
    
    var obj = new JsonObject();
var count = 1;
//  obj["city"] = city;
obj["city"] = city;

foreach (var day in forecast.AsArray())
{
    string output = day["time"].ToString().Split('T')[0];
    dateList.Add(output);
    // 1. Use 'new JsonObject' instead of an anonymous object 'new { ... }'
    // 2. Use bracket notation [...] for the property names inside the JsonObject
    // 3. Use '.DeepClone()' or cast to a type to avoid the "parent node" error
    obj[$"day{count}"] = new JsonObject
    {
        // ["date"] = output,
        ["AvgTemp"] = day["values"]["temperatureAvg"]?.DeepClone(),
        ["MinTemp"] = day["values"]["temperatureMin"]?.DeepClone(),
        ["MaxTemp"] = day["values"]["temperatureMax"]?.DeepClone()
    };
    
    count++;
}
// console.WriteLine("Final JSON Object: {0}", obj.ToJsonString());
Console.WriteLine("dateList ", dateList);
Console.WriteLine("dateList: {0}", string.Join(", ", dateList));
// finalArray.Add(string.Join(", ", dateList));
finalArray.Add(obj);
finalObject["dates"] = new JsonArray(dateList.Select(d => JsonValue.Create(d)).ToArray());
finalObject["WeatherInfo"] = obj;
// finalArray.Add(new JsonObject { ["dates"] = new JsonArray(dateList.Select(d => JsonValue.Create(d)).ToArray()) });

    return finalObject;
});

app.MapPost("/weatherforecast", async (List<string> cities) =>
{
    var weatherObject = new JsonObject();
    var results = new JsonArray();
    List<string> dateList = new List<string>();

    foreach (var city in cities)
    {
        var obj = new JsonObject();
        var apiKey = "rbnJGFja2c7yWv0h1rjgjc4bU1wV9rxP";
        var options = new RestClientOptions($"https://api.tomorrow.io/v4/weather/forecast?location={city}&apikey={apiKey}");
        var client = new RestClient(options);
        var request = new RestRequest("");
        request.AddHeader("accept-encoding", "deflate, gzip, br");
        request.AddHeader("accept", "application/json");
        var response = await client.GetAsync(request);

        var jsonResponse = JsonNode.Parse(response.Content);
        var forecast = jsonResponse?["timelines"]?["daily"];
        obj["city"] = city;
        int count = 1;

        if (forecast != null)
        {
            foreach (var day in forecast.AsArray())
            {
                string output = day["time"].ToString().Split('T')[0];
                dateList.Add(output);
                obj[$"day{count}"] = new JsonObject
                {
                    ["AvgTemp"] = day["values"]["temperatureAvg"]?.DeepClone(),
                    ["MinTemp"] = day["values"]["temperatureMin"]?.DeepClone(),
                    ["MaxTemp"] = day["values"]["temperatureMax"]?.DeepClone()
                };
                count++;
            }
        }
        
        results.Add(obj);
    }

        weatherObject["dates"] = new JsonArray(dateList.Distinct().Select(d => JsonValue.Create(d)).ToArray());
        weatherObject["WeatherInfo"] = results;
    return weatherObject;
});

app.UseCors("AllowWeatherUiApp");
app.Run();
