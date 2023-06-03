import random
import bcrypt
import faker
import itertools
import datetime

N_SCHOOLS = 5
N_AUTHORS = 50
N_CATEGORIES = 10
N_KEYWORDS = 100
N_PUBLISHERS = 30
N_BOOKS = 1000
N_ITEMS = 10000

N_USERS = 500
P_NACTIVE = 0.05
P_ADMIN = 0.025
P_LIBEDITOR = 2*N_SCHOOLS/N_USERS
P_TEACHER = 0.15 #percentage of teachers of those not libeditors/admins

N_REVIEWS = 10000
P_NACTIVEREVIEWS = 0.002

N_BORROWS = 5000
END_DATE = datetime.datetime.now()
START_DATE = END_DATE - datetime.timedelta(days=365)
P_LATEBORROW = 0.05
N_DAYSBORROW = 7
N_DAYSLATEBORROW = 30

N_BOOKINGS = 1500

random.seed(42)
faker.Faker.seed(42)

isbns = []
user_school = dict()
item_school = dict()
lib_editors = set()

def fake_books_items(f):
    global isbns
    fake = faker.Faker()

    def build_book(isbn):
        title = fake.sentence()
        summary = fake.paragraph(nb_sentences=10)
        authors = random.sample(range(1,N_AUTHORS+1), random.randint(1,3))
        categories = random.sample(range(1,N_CATEGORIES+1), random.randint(1,4))
        keywords = random.sample(range(1,N_KEYWORDS+1), random.randint(1,10))
        publisher = random.randint(1, N_PUBLISHERS)
        page_number = random.randint(50,1000)
        image_uri = fake.image_url()
        language = fake.language_name()
        return [f"INSERT INTO book (isbn, title, summary, publisher_id, page_number, image_uri, language) VALUES\
 ('{isbn}', '{title}', '{summary}', {publisher}, {page_number}, '{image_uri}', '{language}');\n",\
                *[f"INSERT INTO book_author (isbn, author_id) VALUES ('{isbn}', {author_id});\n" for author_id in authors],\
                *[f"INSERT INTO book_category (isbn, category_id) VALUES ('{isbn}', {category_id});\n" for category_id in categories],\
                *[f"INSERT INTO book_keyword (isbn, keyword_id) VALUES ('{isbn}', {keyword_id});\n" for keyword_id in keywords]]

    def build_item(item_id):
        isbn = random.choice(isbns)
        school = random.randint(1, N_SCHOOLS)
        item_school[item_id] = school
        return f"INSERT INTO item (isbn, school_id) VALUES ('{isbn}', {school});\n"

    isbns = [fake.unique.isbn13(separator='') for _ in range(N_BOOKS)]
    authors = (fake.unique.name() for _ in range(N_AUTHORS))
    categories = (fake.unique.word() for _ in range(N_CATEGORIES))
    keywords = (fake.unique.word() for _ in range(N_KEYWORDS))
    publishers = (fake.unique.company() for _ in range(N_PUBLISHERS))
    books = (build_book(isbn) for isbn in isbns) 
    items = (build_item(item_id) for item_id in range(1,N_ITEMS+1))

    for author in authors:
        f.write(f"INSERT INTO author (author_name) VALUES ('{author}');\n")
    f.write("\n")
    for category in categories:
        f.write(f"INSERT INTO category (category_name) VALUES ('{category}');\n")
    f.write("\n")
    for keyword in keywords:
        f.write(f"INSERT INTO keyword (keyword_name) VALUES ('{keyword}');\n")
    f.write("\n")
    for publisher in publishers:
        f.write(f"INSERT INTO publisher (publisher_name) VALUES ('{publisher}');\n")
    f.write("\n")
    for book in books:
        for sql in book: f.write(sql)
        f.write("\n")
    f.write("\n")
    for item in items:
        f.write(item)

def fake_schools(f):
    fake = faker.Faker()

    def build_school():
        name = fake.company()
        address = fake.street_address()
        city = fake.city()
        phone = fake.unique.msisdn()
        email = fake.unique.company_email()
        return f"INSERT INTO school (name, address, city, phone, email) VALUES ('{name}', '{address}', '{city}', '{phone}', '{email}');\n"
    
    schools = (build_school() for _ in range(N_SCHOOLS))

    for school in schools:
        f.write(school)

def fake_users(f):
    fake = faker.Faker()

    def build_user(user_id):
        school = random.randint(1, N_SCHOOLS)
        user_school[user_id] = school
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = fake.unique.email()
        username = fake.unique.user_name()
        password_hash = bcrypt.hashpw(username.encode("utf-8"), bcrypt.gensalt(4)).decode("utf-8")
        active = random.random() > P_NACTIVE
       

        role = random.random()
        if role < P_ADMIN: role = ['admin']
        elif role < P_ADMIN+P_LIBEDITOR:
            role = ['teacher', 'lib_user']
            lib_editors.add(user_id)
        else: role = ['teacher' if random.random() < P_TEACHER else 'student']

        if 'student' in role:
            dob = fake.date_of_birth(minimum_age=5, maximum_age=18)
        else:
            dob = fake.date_of_birth(minimum_age=18, maximum_age=70)

        return [f"INSERT INTO \"user\" (school_id, first_name, last_name, email, username, password_hash, dob, active) VALUES\
 ({school}, '{first_name}', '{last_name}', '{email}', '{username}', '{password_hash}', '{dob}', {'true' if active else 'false'});\n",
 *(f"INSERT INTO \"{table}\" (user_id) VALUES ({user_id});\n" for table in role)]

    users = (build_user(user_id) for user_id in range(1,N_USERS+1))

    for user in users:
        for sql in user: f.write(sql)

def fake_reviews(f):
    fake = faker.Faker()
    
    def build_review(user_id, isbn):
        rate = random.randint(1,5)
        body = fake.paragraph(nb_sentences=4)
        active = random.random() > P_NACTIVEREVIEWS
        
        return f"INSERT INTO review (user_id, isbn, rate, body, active) VALUES ({user_id}, '{isbn}', {rate}, '{body}', {'true' if active else 'false'});\n"

    reviews = (build_review(user_id, isbn) for user_id, isbn in random.sample(list(itertools.product(range(1, N_USERS+1), isbns)), N_REVIEWS))

    for review in reviews:
        f.write(review)

def fake_borrows(f):
    fake = faker.Faker()

    def build_borrow():
        start = fake.date_time_between_dates(START_DATE, END_DATE)
        late = random.random() < P_LATEBORROW

        end = start + datetime.timedelta(hours=random.randint(1,24*N_DAYSBORROW) if not late else random.randint(24*(N_DAYSBORROW+1), 24*N_DAYSLATEBORROW))
        if end > datetime.datetime.now(): end = None
        
        borrower = random.randint(1, N_USERS)
        
        lender = list(filter(lambda x: user_school[x] == user_school[borrower] and x in lib_editors, range(1,N_USERS+1)))
        if len(lender) == 0: return None
        lender = random.choice(lender)

        item_id = list(filter(lambda x: item_school[x] == item_school[borrower], range(1,N_ITEMS+1)))
        if len(item_id) == 0: return None
        item_id = random.choice(item_id)
        
        expected_return = (start + datetime.timedelta(days=7)).date()

        return f"""INSERT INTO borrow (item_id, borrower_id, lender_id, period, expected_return) VALUES\
 ({item_id}, {borrower}, {lender}, TSTZRANGE('{start.isoformat()}', {f"'{end.isoformat()}'" if end is not None else 'NULL'}), '{expected_return.isoformat()}')\
 ON CONFLICT DO NOTHING;\n"""


    borrows = (build_borrow() for _ in range(N_BORROWS))
    for borrow in borrows:
        if borrow is None: continue
        f.write(borrow)

def fake_bookings(f):
    fake = faker.Faker()

    def build_booking():
        start = fake.date_time_between_dates(START_DATE, END_DATE)
        end = start + datetime.timedelta(days=7)
        
        user_id = random.randint(1, N_USERS)
        isbn = random.choice(isbns)
        
        return f"""INSERT INTO booking (isbn, user_id, period) VALUES\
 ('{isbn}', {user_id}, TSTZRANGE('{start.isoformat()}', '{end.isoformat()}'))\
 ON CONFLICT DO NOTHING;\n"""


    bookings = (build_booking() for _ in range(N_BOOKINGS))
    for booking in bookings:
        f.write(booking)


with open("fake_data.sql", "w") as f:
    f.write("BEGIN;\n")
    fake_schools(f)
    f.write("\n")
    fake_books_items(f)
    f.write("\n")
    fake_users(f)
    f.write("\n")
    fake_reviews(f)
    f.write("\n")
    fake_borrows(f)
    f.write("\n")
    fake_bookings(f)
    f.write("COMMIT;\n")
