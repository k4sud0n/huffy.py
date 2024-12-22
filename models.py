from tortoise import fields
from tortoise.models import Model


class Notice(Model):
    id = fields.IntField(pk=True)
    date = fields.DateField(null=False)
    title = fields.TextField(null=False)
    link = fields.TextField(null=False)


class Menu(Model):
    id = fields.IntField(pk=True)
    date = fields.DateField(null=False)
    location = fields.CharField(max_length=6)
    menu1 = fields.TextField(null=True)
    menu2 = fields.TextField(null=True)
    menu3 = fields.TextField(null=True)
    menu4 = fields.TextField(null=True)
    menu5 = fields.TextField(null=True)
