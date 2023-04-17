import json




def serializer(data_list, data_fields_cursor):
    data_fields = [data_field[0] for data_field in data_fields_cursor]
    dicts = [dict(zip(data_fields, d)) for d in data_list]
    return dicts