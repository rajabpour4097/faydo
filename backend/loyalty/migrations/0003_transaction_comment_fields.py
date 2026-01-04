# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loyalty', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='can_comment',
            field=models.BooleanField(default=False, verbose_name='امکان کامنت‌گذاری'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='comment_deadline',
            field=models.DateTimeField(blank=True, null=True, verbose_name='مهلت کامنت‌گذاری'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='has_commented',
            field=models.BooleanField(default=False, verbose_name='کامنت گذاشته شده'),
        ),
    ]
