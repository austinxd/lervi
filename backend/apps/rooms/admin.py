from django.contrib import admin

from .models import BedConfiguration, BedConfigurationDetail, Room, RoomType, RoomTypePhoto


class BedConfigurationDetailInline(admin.TabularInline):
    model = BedConfigurationDetail
    extra = 1


class RoomTypePhotoInline(admin.TabularInline):
    model = RoomTypePhoto
    extra = 1


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "property", "base_price", "is_active"]
    list_filter = ["property__organization", "is_active"]
    inlines = [RoomTypePhotoInline]


@admin.register(BedConfiguration)
class BedConfigurationAdmin(admin.ModelAdmin):
    list_display = ["name", "room_type"]
    inlines = [BedConfigurationDetailInline]


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ["number", "property", "get_room_types", "status"]
    list_filter = ["property__organization", "status"]
    search_fields = ["number"]
    filter_horizontal = ["room_types"]

    @admin.display(description="Tipos")
    def get_room_types(self, obj):
        return ", ".join(rt.name for rt in obj.room_types.all())
