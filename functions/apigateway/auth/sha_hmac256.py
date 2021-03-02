# -*- coding:utf-8 -*-

import hmac
import hashlib
import base64


class six:  # or `pip install six` and `import six`
    import sys
    text_type = str if sys.version_info[0] == 3 else unicode
    binary_type = bytes if sys.version_info[0] == 3 else str


def ensure_binary(value):
    if isinstance(value, six.text_type):
        value = value.encode(encoding='utf-8')
    return value


def ensure_str(value):
    if isinstance(value, six.binary_type):
        value = value.decode(encoding='utf-8')
    return value


def sign(source, secret):
    h = hmac.new(ensure_binary(secret), ensure_binary(source), hashlib.sha256)
    signature = base64.encodestring(h.digest()).strip()
    return ensure_str(signature)
