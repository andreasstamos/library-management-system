from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema

bp = Blueprint("admin-ops", __name__)

# ADMIN OPERATIONS