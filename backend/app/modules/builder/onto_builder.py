import json

from app.modules.schema.main.ingredients import Ingredients as Ingredients
from app.modules.schema.main.mapped_ingredient_values import MappedIngredientValues
from app.modules.schema.main.primary_ingredients import PrimaryIngredients


class OntoBuilder:
    def __init__(self, filename, session, encoding="utf-8"):
        data = {
            "last_id": 0,
            "namespaces": {
                "default": "http://knova.ru/user/1705990485419",
                "ontolis-avis": "http://knova.ru/ontolis-avis",
                "owl": "http://www.w3.org/2002/07/owl",
                "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns",
                "rdfs": "http://www.w3.org/2000/01/rdf-schema",
                "xsd": "http://www.w3.org/2001/XMLSchema"
            },
            "nodes": [
            ],
            "relations": [
            ],
            "visualize_ont_path": ""
        }
        self.data = data
        self.filename = filename
        self.session = session
        self.encoding = encoding

    def start_building(self):
        mapped_values = self.session.query(MappedIngredientValues).all()
        for value in mapped_values:
            ingredient = self.session.query(Ingredients).where(Ingredients.id == value.ingredient_id).first()
            primary = self.session.query(PrimaryIngredients).where(PrimaryIngredients.id == value.primary_id).first()

            inode = self.get_node_by_name(ingredient.name)
            if not inode:
                inode = self.add_node_to_ontology(ingredient.name)

            pnode = self.get_node_by_name(primary.name)
            if not pnode:
                pnode = self.add_node_to_ontology(primary.name)

            if ingredient.name != primary.name:
                self.add_link_to_ontology(inode, pnode, "")
                self.add_link_to_ontology(pnode, inode, "")

    def get_nodes(self):
        return self.data["nodes"]

    def get_links(self):
        return self.data["relations"]

    def get_node_by_name(self, nodeName):
        for node in self.get_nodes():
            if node["name"] == nodeName:
                return node
        return None

    def add_node_to_ontology(self, nodeName):
        self.data["last_id"] = self.data["last_id"] + 1
        node = {
            "attributes": {},
            "id": self.data["last_id"],
            "name": nodeName,
            "namespace": self.data["namespaces"]["default"],
            "position_x": 0,
            "position_y": 0
        }
        self.get_nodes().append(node)
        return node

    def add_link_to_ontology(self, src, dst, linkName):
        self.data["last_id"] = self.data["last_id"] + 1
        link = {
            "attributes": {},
            "destination_node_id": dst["id"],
            "id": self.data["last_id"],
            "name": linkName,
            "namespace": self.data["namespaces"]["default"],
            "source_node_id": src["id"]
        }
        self.get_links().append(link)
        return link

    def save_ontology(self):
        with open(f"./app/modules/builder//{self.filename}", "w") as f:
            json.dump(self.data, f)
