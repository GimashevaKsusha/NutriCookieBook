from bs4 import BeautifulSoup
import requests
import re
import uuid
import sqlite3

from app.modules.schema.public.parsing_themes import ParsingThemes
from .onto_parser import OntoParser


class WebParser:
    def __init__(self, filepath, session):
        self.main_url = None
        self.page = None
        self.step = None
        self.structure = None
        self.theme = None
        self.url = None
        self.db = None
        self.session = session
        try:
            self.onto = OntoParser(filepath)
        except ValueError as err:
            raise ValueError(f"Ошибка с онтологией! {err}")

    def start_parsing(self):
        # найти старт
        start = self.onto.get_first_node_by_name("Старт")

        # найти первый этап - получить HTML головной страницы
        first_stage = self.onto.get_nodes_linked_from(start, "")[0]

        # заполнить поля класса
        self.main_url = first_stage["attributes"]["main_url"]
        self.page = first_stage["attributes"]["page"]
        self.step = first_stage["attributes"]["step"]
        self.structure = first_stage["attributes"]["structure"]
        self.theme = first_stage["attributes"]["theme"]
        self.url = first_stage["attributes"]["url"]

        # найти второй этап - создать таблицы БД
        second_stage = self.onto.get_nodes_linked_from(first_stage, "next")[0]
        self.create_db(second_stage)

        # найти третий этап - получить список URL страниц
        third_stage = self.onto.get_nodes_linked_from(second_stage, "next")[0]
        list_url = self.get_list_of_url(third_stage)
        # найти четвертый этап - список пустой?
        fourth_stage = self.onto.get_nodes_linked_from(third_stage, "next")[0]
        # если да, остановить парсинг, так как все данные с головной страницы были извлечены
        if not list_url:
            return "Парсинг завершен! Все данные с сайта были извлечены и добавлены в БД!"

        # найти пятый этап - получить URL очередной страницы
        fifth_stage = self.onto.get_nodes_linked_from(fourth_stage, "no")[0]

        for url in list_url:
            # найти шестой этап - получить теги категорий
            sixth_stage = self.onto.get_nodes_linked_from(fifth_stage, "next")[0]

            # найти седьмой этап - распарсить данные с очередной страницы
            seventh_stage = self.onto.get_nodes_linked_from(sixth_stage, "next")[0]

            data = self.parse_data_from_url(self.url + url, sixth_stage)
            # перейти к следующей ссылке, если с текущей странице не получилось собрать всю информацию
            if not data:
                continue

            # найти восьмой этап - пополнить БД
            eighth_stage = self.onto.get_nodes_linked_from(seventh_stage, "next")[0]

            self.insert_data_to_db(self.url + url, data, eighth_stage)

            # найти девятый этап - конец?
            ninth_stage = self.onto.get_nodes_linked_from(eighth_stage, "next")[0]

        # вернуть пользователю вопрос, продолжать парсинг или нет

        return "Часть данных с сайта была извлечена! Для продолжения запустите парсер заново!"

    def get_sql_query(self, node, data, url, index=-1):
        i = 1
        field = self.onto.get_nodes_linked_from(node, f"{i}")
        table = self.onto.get_nodes_linked_from(node, "table")[0]
        query = f"INSERT INTO {table['name']} VALUES ("
        while True:
            prop = self.onto.get_nodes_linked_from(field[0], "prop")[0]
            if prop['name'] in data:
                if index == -1 or len(data[prop['name']]) <= index:
                    query = query + f"'{' '.join(data[prop['name']])}'"
                else:
                    query = query + f"'{data[prop['name']][index]}'"
            elif "Идентификатор" in prop['name']:
                id = str(uuid.uuid4())
                query = query + f"'{id}'"
                data[prop['name']] = [id]
            elif "URL" in prop['name']:
                query = query + f"'{url}'"

            i = i + 1
            field = self.onto.get_nodes_linked_from(node, f"{i}")
            if not field:
                query = query + ");\n"
                break
            else:
                query = query + ", "

        return query, data

    def check_availability_in_db(self, node, data, url, index=-1):
        i = 1
        id = ""
        param = self.onto.get_nodes_linked_from(node, f"{i}")
        table = self.onto.get_nodes_linked_from(node, "table")[0]["name"]
        query = f"""SELECT id FROM {table} WHERE """
        while True:
            prop = self.onto.get_nodes_linked_from(param[0], "prop")[0]
            field = self.onto.get_nodes_linked_from(param[0], "field")[0]
            if "URL" in prop['name']:
                query = query + f"{field['name']}='{url}'"
            elif field['name'] != 'id':
                if index == -1 or len(data[prop['name']]) <= index:
                    query = query + f"{field['name']}='{' '.join(data[prop['name']])}'"
                else:
                    query = query + f"{field['name']}='{data[prop['name']][index]}'"
            else:
                id = prop["name"]

            i = i + 1
            param = self.onto.get_nodes_linked_from(node, f"{i}")
            if not param:
                query = query + ";"
                break
            elif field['name'] != 'id':
                query = query + " AND "

        connection = None
        result = None
        try:
            connection = sqlite3.connect(f"./app/sources/web_sources/{self.db}", check_same_thread=False)
            cursor = connection.cursor()
            cursor.execute(query)
            connection.commit()
            result = cursor.fetchone()
            cursor.close()
        except sqlite3.Error as err:
            raise Exception(f"Ошибка при работе с sqlite! {err}")
        finally:
            if connection:
                connection.close()

        return id, result

    # восьмой этап парсинга - пополнить БД
    def insert_data_to_db(self, url, data, node):
        name = self.theme.split(" - ")
        theme = self.session.query(ParsingThemes) \
            .where(ParsingThemes.first_category == name[0], ParsingThemes.second_category == name[1]).first()

        first_category = self.onto.get_typed_nodes_linked_from(node, '', theme.first_category)[0]
        second_category = self.onto.get_typed_nodes_linked_from(node, '', theme.second_category)[0]
        connection = self.onto.get_typed_nodes_linked_from(node, '', theme.connection)[0]

        # проверить, есть ли уже в БД значение первой категории
        name, result = self.check_availability_in_db(first_category, data, url)
        # если есть, не выполнять добавление в БД
        if result:
            return

        query, data = self.get_sql_query(first_category, data.copy(), url)
        count = len(data[theme.connection])
        for i in range(count):
            # проверить, есть ли уже в БД значение второй категории
            # если есть, записать найденный идентификатор
            name1, result1 = self.check_availability_in_db(second_category, data, url, i)

            if not result1:
                text1, data1 = self.get_sql_query(second_category, data.copy(), url, i)
                query = query + text1
            else:
                data1 = data.copy()
                data1[name1] = [result1[0]]

            text2, data1 = self.get_sql_query(connection, data1.copy(), url, i)
            query = query + text2

        connection = None
        try:
            connection = sqlite3.connect(f"./app/sources/web_sources/{self.db}", check_same_thread=False)
            cursor = connection.cursor()
            cursor.executescript(query)
            connection.commit()
            cursor.close()
        except sqlite3.Error as err:
            raise Exception(f"Ошибка при работе с sqlite! {err}")
        finally:
            if connection:
                connection.close()

    # седьмой этап парсинга - распарсить данные с очередной страницы
    def parse_data_from_url(self, url, node):
        page = requests.get(url)
        soup = BeautifulSoup(page.text, "html.parser")
        data = {}
        for n in node["attributes"]:
            tag_name = node["attributes"][n]["tag"]
            attr_prop_name = node["attributes"][n]["attr_prop"]
            attr_value_name = node["attributes"][n]["attr_value"]
            value_name = node["attributes"][n]["value"]
            nullable = node["attributes"][n]["nullable"]

            if attr_prop_name == "":
                elements = soup.findAll(tag_name)
            else:
                elements = soup.findAll(tag_name, attrs={attr_prop_name: attr_value_name})

            if value_name == "":
                result_elements = [re.sub(r'\xa0', ' ',
                                          re.sub(r'[\n\r\t]', '',
                                                 re.sub(r'\'', '`', x.text))) for x in elements]
            else:
                result_elements = [re.sub(r'\xa0', ' ',
                                          re.sub(r'[\n\r\t]', '',
                                                 re.sub(r'\'', '`', x[value_name]))) for x in elements]

            if nullable == "false" and not result_elements:
                return None

            data[n] = result_elements

        return data

    # третий этап парсинга - получить список URL страниц
    def get_list_of_url(self, node):
        current_page = node['attributes']['current_page']
        current_amount = node['attributes']['current_amount']
        if self.structure == "multi":
            page = requests.get(f"{self.main_url}?page={current_page}")
            soup = BeautifulSoup(page.text, "html.parser")

            list_url = []

            if len(list_url) <= int(current_amount):
                current_page = int(current_page) + 1
                current_amount = 0
                page = requests.get(f"{self.main_url}?page={current_page}")
                soup = BeautifulSoup(page.text, "html.parser")

                list_url = []
                for x in soup.findAll("a", href=re.compile(rf'^/.*')):
                    if x["href"] not in list_url:
                        list_url.append(x["href"])

            list_url = list_url[int(current_amount):][:int(self.step)]

            self.onto.set_attribute(node, "current_page", current_page)
            self.onto.set_attribute(node, "current_amount", int(current_amount) + len(list_url))

        else:
            page = requests.get(f"{self.main_url}")
            soup = BeautifulSoup(page.text, "html.parser")

            list_url = []
            for x in soup.findAll("a", href=re.compile(rf'^/.*')):
                if x["href"] not in list_url:
                    list_url.append(x["href"])

            list_url = list_url[int(current_amount):][:int(self.step)]
            self.onto.set_attribute(node, "current_amount", int(current_amount) + len(list_url))

        return list_url

    # второй этап парсинга - создать таблицы БД
    def create_db(self, node):
        name = self.theme.split(" - ")
        self.db = node["attributes"]["db"]

        # создать таблицы БД
        connection = None
        try:
            connection = sqlite3.connect(f"./app/sources/web_sources/{self.db}", check_same_thread=False)
            cursor = connection.cursor()
            cursor.executescript(node["attributes"]["create_script"])
            connection.commit()
            cursor.close()
        except sqlite3.Error as err:
            raise Exception(f"Ошибка при работе с sqlite! {err}")
        finally:
            if connection:
                connection.close()
