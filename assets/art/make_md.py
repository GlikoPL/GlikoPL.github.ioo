import os

directory = os.fsencode('7')

for file in os.listdir(directory):
    filename = os.fsdecode(file)
    print(f'<img src="/assets/art/7/{filename}" alt="drawing">')
