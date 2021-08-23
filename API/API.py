import requests
from flask import Flask, render_template, request, json
# pip install -U flask-cors
from flask_cors import CORS, cross_origin
#from Cryptodome.Hash import HMAC
#from Cryptodome.Hash import SHA256
from Crypto.Hash import HMAC
from Crypto.Hash import SHA256
from datetime import datetime
from dateutil.tz import tzlocal

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/")
@cross_origin()
def hello():
    return "Servidor rodandooo"


@app.route('/pegarPluviometria', methods=['POST'])
def pegarPluviometria():

    idPropriedade = request.form['idPropriedade']
    idEmpresa = request.form['idEmpresa']
    token = 'Bearer ' + request.form['token']

    requisicao = requests.get('https://api.beta.protector.strider.ag/v1/timeline/static-points?fields=ALL%2CUNNINSTALLED', headers={"authorization": token,
                                                                                                                                    "x-Company-Id": idEmpresa,
                                                                                                                                    "content-type": "application/json"}, params={"property_id": idPropriedade})

    return json.dumps(requisicao.json())


@app.route('/pegarPluviometriaMETOS', methods=['POST'])
def pegarPluviometriaMETOS():

    path = '/data/' + request.form['idEstacao'] + \
        '/5/last/'+request.form['dias']+'d'
    publicKey = request.form['publicKey']
    privateKey = request.form['privateKey']

    dateStamp = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')

    msg = ('GET' + path + dateStamp + publicKey).encode(encoding='utf-8')
    h = HMAC.new(privateKey.encode(encoding='utf-8'), msg, SHA256)
    signature = h.hexdigest()

    authorizationString = 'hmac ' + publicKey + ':' + signature

    requisicao = requests.get('https://api.fieldclimate.com/v2' + path, headers={
        "ACCEPT": "application/json",
        "AUTHORIZATION": authorizationString,
        "DATE": dateStamp})

    return json.dumps(requisicao.json())


@app.route('/pegarDadoEstacaoMETOS', methods=['POST'])
def pegarDadoEstacaoMETOS():

    path_Estacao = '/station/' + request.form['idEstacao']
    publicKey = request.form['publicKey']
    privateKey = request.form['privateKey']

    dateStamp = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')

    msg_Estacao = ('GET' + path_Estacao + dateStamp +
                   publicKey).encode(encoding='utf-8')
    h_Estacao = HMAC.new(privateKey.encode(
        encoding='utf-8'), msg_Estacao, SHA256)
    signature_Estacao = h_Estacao.hexdigest()

    authorizationString_Estacao = 'hmac ' + publicKey + ':' + signature_Estacao

    requisicao = requests.get('https://api.fieldclimate.com/v2' + path_Estacao, headers={
        "ACCEPT": "application/json",
        "AUTHORIZATION": authorizationString_Estacao,
        "DATE": dateStamp})

    return json.dumps(requisicao.json())


@app.route('/pegarPluviometriaFarmBox', methods=['POST'])
def pegarPluviometriaFarmBox():

    chaveProdutor = request.form['chaveProdutor']
    pagina = request.form['pagina']

    requisicao = requests.get('https://farmbox.cc/api/v1/pluviometer_monitorings', headers={
        "Authorization": chaveProdutor,
        "Content-Type": chaveProdutor,
        "Accept": "application/json"}, params={"page": pagina})

    return json.dumps(requisicao.json())


if __name__ == "__main__":
    app.run()
