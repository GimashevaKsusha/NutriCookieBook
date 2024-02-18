import json


class OntoParser:
    def __init__(self, filepath, file=None, encoding="utf-8"):
        try:
            if filepath != '':
                with open(filepath, encoding=encoding) as f:
                    data = json.load(f)
            else:
                data = json.load(file.file)
        except:
            raise ValueError('Неправильный формат данных в онтологии!')

        if not data:
            raise ValueError("В онтологии нет данных!")

        if "nodes" not in data:
            raise ValueError("В онтологии нет узлов!")

        if "relations" not in data:
            raise ValueError("В онтологии нет связей!")

        self.data = data

    # возвращает список узлов
    def get_nodes(self):
        return self.data["nodes"]

    # возвращает список связей
    def get_links(self):
        return self.data["relations"]

    # возвращает узел с заданным id
    def get_node_by_id(self, node_id):
        for node in self.get_nodes():
            if node["id"] == node_id:
                return node
        return None

    # возвращает список узлов с заданным именем
    def get_nodes_by_name(self, node_name):
        result = []
        for node in self.get_nodes():
            if node["name"] == node_name:
                result.append(node)
        return result

    # возвращает первый узел с заданным именем
    def get_first_node_by_name(self, node_name):
        arr = self.get_nodes_by_name(node_name)
        if arr and len(arr) > 0:
            return arr[0]
        else:
            return None

    # возвращает список родительских узлов
    # связь выходит из исходного узла
    def get_nodes_linked_from(self, node, link_name):
        result = []
        node_id = node["id"]
        for link in self.get_links():
            if (link["source_node_id"] == node_id) and (link["name"] == link_name):
                result.append(self.get_node_by_id(link["destination_node_id"]))
        return result

    # возвращает список потомков узла
    # связь входит в исходных узел
    def get_nodes_linked_to(self, node, link_name):
        result = []
        node_id = node["id"]
        for link in self.get_links():
            if (link["destination_node_id"] == node_id) and (link["name"] == link_name):
                result.append(self.get_node_by_id(link["source_node_id"]))
        return result

    # проверяет, есть ли у заданного узла родитель с заданным именем
    def is_node_of_type(self, node, node_type):
        linked = self.get_nodes_linked_from(node, "is_a")
        for lnode in linked:
            if lnode["name"] == node_type:
                return True
        return False

    # проверяет, есть ли у заданного узла свойство с заданным именем
    def is_prop_node_of_type(self, node, node_type):
        linked = self.get_nodes_linked_from(node, "prop")
        for lnode in linked:
            if lnode["name"] == node_type:
                return True
        return False

    # возвращает список узлов,
    # которые являются родителями для исходного
    # которые имеют родителя с заданным именем
    def get_typed_nodes_linked_from(self, node, link_name, node_type):
        result = []
        linked = self.get_nodes_linked_from(node, link_name)
        for lNode in linked:
            rels = self.get_nodes_linked_from(lNode, "is_a")
            for rnode in rels:
                if rnode["name"] == node_type:
                    result.append(lNode)
                    break
        return result

    # возвращает список узлов,
    # которые являются потомками для исходного
    # которые имеют родителя с заданным именем
    def get_typed_nodes_linked_to(self, node, link_name, node_type):
        result = []
        linked = self.get_nodes_linked_to(node, link_name)
        for lNode in linked:
            rels = self.get_nodes_linked_from(lNode, "is_a")
            for rNode in rels:
                if rNode["name"] == node_type:
                    result.append(lNode)
                    break
        return result

    def has_link(self, src_id, dst_id, link_name):
        for link in self.get_links():
            if link["source_node_id"] == src_id and link["destination_node_id"] == dst_id \
                    and link["name"] == link_name:
                return True
        return False

    # возвращает первый узел с указанным именем, который имеет родителя с указанным именем
    def get_node_with_parent(self, node_name, parent_name):
        nodes = self.get_nodes_by_name(node_name)
        for node in nodes:
            if self.is_node_of_type(node, parent_name):
                return node
        return None

    # возвращает узел со значением свойства для указанного узла с указанным именем
    def get_value_by_prop(self, main_node, prop_name):
        nodes = self.get_nodes_linked_from(main_node, 'has')
        for node in nodes:
            if self.is_prop_node_of_type(node, prop_name):
                return self.get_nodes_linked_from(node, 'value')[0]
        return None

    def set_attribute(self, node, attr_name, attr_value):
        for i in range(len(self.data['nodes'])):
            if self.data['nodes'][i]['id'] == node['id']:
                self.data['nodes'][i]['attributes'][attr_name] = attr_value
                return

    def set_attribute_for_subject(self, node, attr_sub, attr_name, attr_value):
        for i in range(len(self.data['nodes'])):
            if self.data['nodes'][i]['id'] == node['id']:
                self.data['nodes'][i]['attributes'][attr_sub][attr_name] = attr_value
                return
