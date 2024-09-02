from django.db import models
    
class Country(models.Model):
    name = models.CharField(max_length=255)
    official_name = models.CharField(max_length=255, null=True, blank=True)
    alpha2_code = models.CharField(max_length=2, unique=True)
    alpha3_code = models.CharField(max_length=3, unique=True)
    capital = models.CharField(max_length=255, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    subregion = models.CharField(max_length=255, null=True, blank=True)
    population = models.BigIntegerField(null=True, blank=True)
    area = models.FloatField(null=True, blank=True)
    timezones = models.JSONField(null=True, blank=True)
    borders = models.JSONField(null=True, blank=True)
    currencies = models.JSONField(null=True, blank=True)
    languages = models.JSONField(null=True, blank=True)
    flag = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    


