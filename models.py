from tortoise import fields
from tortoise.models import Model


class Menu(Model):
    id = fields.IntField(pk=True)
    date = fields.DateField(auto_now_add=True)
    menu1 = fields.TextField()
    menu2 = fields.TextField()
    menu3 = fields.TextField()
    menu4 = fields.TextField()
