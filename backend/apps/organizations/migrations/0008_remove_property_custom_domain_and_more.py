# Migration: Move theme/brand fields from Property to Organization
# Step 1: Add fields to Organization
# Step 2: Copy data from first active Property per Organization
# Step 3: Remove fields from Property

from django.db import migrations, models


def copy_theme_to_organization(apps, schema_editor):
    """Copy theme fields from each org's first active property."""
    Organization = apps.get_model('organizations', 'Organization')
    Property = apps.get_model('organizations', 'Property')

    for org in Organization.objects.all():
        prop = Property.objects.filter(
            organization=org, is_active=True
        ).order_by('created_at').first()
        if not prop:
            continue
        org.theme_template = prop.theme_template
        org.theme_palette = prop.theme_palette
        org.theme_primary_color = prop.theme_primary_color
        org.theme_accent_color = prop.theme_accent_color
        org.website_url = prop.website_url
        org.social_links = prop.social_links
        org.save(update_fields=[
            'theme_template', 'theme_palette',
            'theme_primary_color', 'theme_accent_color',
            'website_url', 'social_links',
        ])


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0007_bankaccount'),
    ]

    operations = [
        # Step 1: Add new fields to Organization
        migrations.AddField(
            model_name='organization',
            name='social_links',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='organization',
            name='theme_accent_color',
            field=models.CharField(blank=True, default='', max_length=7),
        ),
        migrations.AddField(
            model_name='organization',
            name='theme_palette',
            field=models.CharField(default='navy-gold', max_length=30),
        ),
        migrations.AddField(
            model_name='organization',
            name='theme_primary_color',
            field=models.CharField(blank=True, default='', max_length=7),
        ),
        migrations.AddField(
            model_name='organization',
            name='theme_template',
            field=models.CharField(choices=[('essential', 'Essential / Boutique'), ('signature', 'Signature / Experience'), ('premium', 'Premium / Luxury')], default='signature', max_length=20),
        ),
        migrations.AddField(
            model_name='organization',
            name='website_url',
            field=models.URLField(blank=True, default=''),
        ),

        # Step 2: Copy data from Property to Organization
        migrations.RunPython(
            copy_theme_to_organization,
            migrations.RunPython.noop,
        ),

        # Step 3: Remove fields from Property
        migrations.RemoveField(
            model_name='property',
            name='custom_domain',
        ),
        migrations.RemoveField(
            model_name='property',
            name='social_links',
        ),
        migrations.RemoveField(
            model_name='property',
            name='theme_accent_color',
        ),
        migrations.RemoveField(
            model_name='property',
            name='theme_palette',
        ),
        migrations.RemoveField(
            model_name='property',
            name='theme_primary_color',
        ),
        migrations.RemoveField(
            model_name='property',
            name='theme_template',
        ),
        migrations.RemoveField(
            model_name='property',
            name='website_url',
        ),
    ]
