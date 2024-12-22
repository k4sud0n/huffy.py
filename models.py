from tortoise import fields
from tortoise.models import Model


class Menu(Model):
    id = fields.IntField(pk=True)
    date = fields.DateField(null=False)
    menu1 = fields.TextField(null=True)
    menu2 = fields.TextField(null=True)
    menu3 = fields.TextField(null=True)
    menu4 = fields.TextField(null=True)
    menu5 = fields.TextField(null=True)
