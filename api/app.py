from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pymysql
import json

app = Flask(__name__)
cors = CORS(app)

db = pymysql.connect(host="localhost",user="root",password="root",database="storage" )
cursor = db.cursor()

# error action
@app.errorhandler(405)
def page_not_found(e):
  return jsonify(dict(code=1, message='method error.')), 405

@app.route('/api/login',methods=['POST'])
def login():
  if len(request.form)==0:
    return 'failed'
  else:
    sql_query = "SELECT * FROM user WHERE phone='%s'" % request.form['phone']
    cursor.execute(sql_query)
    user = list(cursor.fetchall())
    if len(user)==0:
      return jsonify({'msg':'用户不存在','code':502})
    else:
      password = list(user[0])[2]
      if password == request.form['password']:
        return jsonify({'msg':'登陆成功','code':200})
      else:
        return jsonify({'msg':'密码错误','code':202})


@app.route('/api/register',methods=['POST'])
def register():
  if len(request.form)==0:
    return 'failed'
  else:
    sql_query = "SELECT * FROM user WHERE phone='%s'" % request.form['phone']
    cursor.execute(sql_query)
    user = list(cursor.fetchall())
    if len(user)==0:
      sql_insert = "INSERT INTO user(name,password,phone) VALUE('%s','%s','%s')" % (request.form['name'],request.form['password'],request.form['phone'])
      cursor.execute(sql_insert)
      db.commit()
      return jsonify({'msg':'注册成功','code':200})
    else:
      return jsonify({'msg':'用户已存在','code':502})

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=8000, debug=True)

  # results = []
  # for user in users:
  #   result = {}
  #   result['id'] = user[0]
  #   result['name'] = user[1]
  #   result['password'] = user[2]
  #   result['phone'] = user[3]
  #   results.append(result)