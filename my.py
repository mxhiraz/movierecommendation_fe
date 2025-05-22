import requests
import urllib.parse
import json

def fetch_movie_data(title):
    base_url = "https://formally-selected-iguana.ngrok-free.app/api/movie/"
    headers = {
        'ngrok-skip-browser-warning': 'true'
    }
    url = f"{base_url}?title={urllib.parse.quote(title)}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data.get("Response") == "True":
            return {
                "title": data.get("Title"),
                "poster": data.get("Poster"),
                "year": data.get("Year"),
                "rating": data.get("imdbRating")
            }
        else:
            print(f"Movie not found: {title}")
    else:
        print(f"Failed to fetch: {title} (Status code: {response.status_code})")
    return None

# List of 5 popular movies in different genres
movies = [
    # Sci-Fi
    "Inception",
    "Interstellar",
    "The Matrix",
    "Blade Runner 2049",
    "Ex Machina",

    # Crime/Thriller
    "The Godfather",
    "Pulp Fiction",
    "Se7en",
    "The Departed",
    "No Country for Old Men",

    # Action
    "The Dark Knight",
    "Gladiator",
    "Mad Max: Fury Road",
    "John Wick",
    "Die Hard",

    # Drama/Romance
    "Forrest Gump",
    "The Shawshank Redemption",
    "La La Land",
    "A Beautiful Mind",
    "The Notebook",

    # Animation/Family
    "Coco",
    "Spirited Away",
    "Toy Story",
    "Up",
    "Finding Nemo"
]

movie_data_list = []

for title in movies:
    data = fetch_movie_data(title)
    if data:
        movie_data_list.append(data)

# Save data to a JSON file
with open("popular_movies.json", "w") as f:
    json.dump(movie_data_list, f, indent=2)

print("Movie data saved to popular_movies.json")
