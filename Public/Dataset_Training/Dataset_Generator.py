import json  #to import json files
import random #to use randint [generate random no]

names_dataset = open('Dataset_Training/Indian_Names.json')
names_json = json.load(names_dataset)


def generate_a_name(): 
    firstname_index = random.randint(0,len(names_json["male"]) - 1) 
    lastname_index = random.randint(0,len(names_json["surnames"]) - 1)
    firstname = names_json["male"][firstname_index]
    lastname = names_json["surnames"][lastname_index]
    print(firstname + " " + lastname)


def generate_contact_no():
    phone_no = random.randint(1111111111,9999999999)
    print(phone_no)


def generate_intake():
    crops = ['rice', 'wheat', 'millets', 'pulses', 'tea', 'coffee', 'sugarcane', 'oil seeds', 'cotton' , 'jute']
    no_of_intakes = random.randint(1,len(crops))
    no_of_elements_to_remove = len(crops) - no_of_intakes

    intake = crops
    price_per_kg = []  

    for i in range(0,no_of_intakes):
        this_price = random.randint(0,200)
        price_per_kg.append(this_price)

    for i in range(0,no_of_elements_to_remove):
        index_to_remove = random.randint(0,len(intake)-1)
        intake.pop(index_to_remove)
    
    print(price_per_kg)
    print(intake)

def generate_rating():
    rating = random.randint(10,50)/10
    print(rating)

def generate_location():
    latutude = random.randint(-90,90)
    longitude = random.randint(-180,180)
    print(latutude , longitude)

generate_a_name()
generate_contact_no()
generate_intake()
generate_rating()
generate_location()