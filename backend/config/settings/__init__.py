import os

environment = os.environ.get("DJANGO_SETTINGS_MODULE", "config.settings.dev")

if environment == "config.settings.dev":
    from .dev import *  # noqa: F401,F403
else:
    from .base import *  # noqa: F401,F403
