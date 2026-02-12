from django.db import migrations, models


def migrate_template_names(apps, schema_editor):
    Property = apps.get_model("organizations", "Property")
    mapping = {
        "luxury": "signature",
        "modern": "essential",
        "tropical": "signature",
    }
    for old_val, new_val in mapping.items():
        Property.objects.filter(theme_template=old_val).update(theme_template=new_val)


def reverse_template_names(apps, schema_editor):
    Property = apps.get_model("organizations", "Property")
    Property.objects.filter(theme_template="essential").update(theme_template="modern")
    Property.objects.filter(theme_template="signature").update(theme_template="luxury")
    Property.objects.filter(theme_template="premium").update(theme_template="luxury")


class Migration(migrations.Migration):

    dependencies = [
        ("organizations", "0004_property_logo"),
    ]

    operations = [
        # First migrate existing data
        migrations.RunPython(migrate_template_names, reverse_template_names),
        # Then alter the field choices + default
        migrations.AlterField(
            model_name="property",
            name="theme_template",
            field=models.CharField(
                choices=[
                    ("essential", "Essential / Boutique"),
                    ("signature", "Signature / Experience"),
                    ("premium", "Premium / Luxury"),
                ],
                default="signature",
                max_length=20,
            ),
        ),
    ]
