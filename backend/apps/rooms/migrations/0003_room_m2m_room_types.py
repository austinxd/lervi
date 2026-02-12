# Custom migration: FK room_type → M2M room_types

from django.db import migrations, models


def copy_fk_to_m2m(apps, schema_editor):
    Room = apps.get_model("rooms", "Room")
    for room in Room.objects.all():
        if room.room_type_id:
            room.room_types.add(room.room_type_id)


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0002_remove_roomtypephoto_url_roomtypephoto_image'),
    ]

    operations = [
        # 1. Add M2M field
        migrations.AddField(
            model_name='room',
            name='room_types',
            field=models.ManyToManyField(blank=True, related_name='rooms', to='rooms.roomtype'),
        ),
        # 2. Copy FK data to M2M
        migrations.RunPython(copy_fk_to_m2m, migrations.RunPython.noop),
        # 3. Remove FK
        migrations.RemoveField(
            model_name='room',
            name='room_type',
        ),
    ]
