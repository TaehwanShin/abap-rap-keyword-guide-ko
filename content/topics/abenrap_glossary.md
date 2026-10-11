---
title: RAP 용어집
summary: RAP 문서에 나오는 용어를 영문 철자순으로 모아 쉬운 우리말로 풀이한 목록입니다.
keywords: 용어집, glossary, 용어, RAP glossary, 용어 풀이, 줄임말, 약어, ABP, BDEF, BDL, EML, RAP BO, SADL, REST
---

## 이 용어집 보는 법

RAP(ABAP RESTful Application Programming Model) 문서에 나오는 용어를 영문 철자순으로 늘어놓았습니다. 제목은 영문 용어이고, 괄호 안에 한글 표기를 적었습니다. 화면 위 검색창에 영문이든 한글이든 넣으면 원하는 용어를 바로 찾을 수 있습니다. "→ … 를 보세요"만 적힌 용어는 같은 뜻의 다른 용어 아래에 설명이 있습니다.

## A

### ABAP behavior pool (ABAP 동작 풀)

줄임말 ABP. behavior definition(동작 정의)를 바탕으로 behavior implementation(동작 구현)을 담는 특별한 클래스 풀입니다. 전역 클래스 이름은 보통 `BP_` 로 시작하지만, 이 전역 클래스가 동작을 직접 구현하지는 않습니다. 실제 구현은 behavior pool(동작 풀)의 CCIMP 인클루드에 있는 지역 handler class(핸들러 클래스)와 saver class(세이버 클래스)에 씁니다. 이 클래스들이 unmanaged RAP BO provider(제공자)가 되고, RAP BO에 접근할 때 RAP 런타임 엔진이 부릅니다. 관련 항목: [[abenabap_behavior_pools]]

### ABAP contract checks (ABAP 계약 검사)

두 가지 검사를 묶어 부르는 말입니다. RAP BO 계약 검사는 RAP BO consumer(사용자)와 RAP BO provider 의 구현이 규칙을 어겼는지 확인합니다. 트랜잭션 계약 검사는 통제된 SAP LUW 개념 안에 구현되어 있고, 트랜잭션 단계에서 일관성을 깨는 동작을 찾아냅니다.

### ABAP EML (ABAP 엔터티 조작 언어)

→ **ABAP Entity Manipulation Language (ABAP entity(엔터티) 조작 언어)** 를 보세요.

### ABAP Entity Manipulation Language (ABAP 엔터티 조작 언어)

줄임말 ABAP EML 또는 EML. ABAP 프로그램에서 RAP business object(비즈니스 객체)에 접근하게 해 주는 ABAP의 한 부분입니다. EML 문을 실행하면 RAP BO 작업이 불려 그 BO의 transactional buffer(트랜잭션 버퍼)에 접근합니다. 이때 EML과 RAP BO는 BDEF derived type(BDEF 파생 타입)으로 된 내부 테이블을 주고받습니다. 어느 프로그램에서나 쓸 수 있고, 특히 behavior pool 안에서 transactional buffer 에 접근할 때 씁니다. 관련 항목: [[abeneml]]

### ABAP RAP (ABAP RESTful 애플리케이션 프로그래밍 모델)

→ **ABAP RESTful Application Programming Model (ABAP RESTful 애플리케이션 프로그래밍 모델)** 을 보세요.

### ABAP RESTful Application Programming Model (ABAP RESTful 애플리케이션 프로그래밍 모델)

줄임말 RAP. ABAP RESTful Programming Model 또는 ABAP RAP 라고도 하며, REST 아키텍처의 요구 조건을 지키는 ABAP 프로그래밍 모델이자 ABAP Cloud 의 트랜잭션 프로그래밍 모델입니다. AS ABAP 는 상태를 기억하지 않는 웹 서버 구실을 하고, 웹 클라이언트의 요청은 OData 프로토콜로 받으며, 세션 상태는 표준 데이터베이스에 저장할 수 있습니다. 모델은 CDS entity 와 behavior definition 으로 만듭니다. 조회는 비즈니스 서비스로 노출한 CDS entity 를 RAP 쿼리 엔진이 읽어 처리하고, 트랜잭션 처리는 managed RAP BO provider 가 동작을 주거나 behavior implementation 에 직접 쓴 RAP business object 가 맡습니다. 관련 항목: [[abenabap_rap]]

### ABP auxiliary class (ABP 보조 클래스)

RAP BO 하나를 가리키면서 그 BO에 넓은 접근 권한이 있는 전역 클래스입니다. 주된 쓰임은 behavior pool 의 구현을 돕는 것입니다. 여러 곳에서 다시 쓸 메서드를 담을 수 있고, 여러 개발자가 RAP 동작을 동시에 구현할 수 있게 해 줍니다. 관련 항목: [[abenbdl_auxiliary_class]], [[abaprap_auxiliary_class]]

### abstract BDEF extension (abstract BDEF 확장)

RAP abstract behavior definition 을 확장하는 개발 객체입니다. `extension for abstract` 문으로 만듭니다. 관련 항목: [[abenbdl_extensibility_abstract]]

### ancestor association (조상 association)

BO 내부 association 가운데, 현재 노드와 RAP BO root entity(루트 엔터티) 사이에 있는 entity 를 대상으로 하는 것입니다. 대상은 구성 트리에서 더 위쪽에 있어야 하므로 형제 노드나 현재 노드의 CDS parent entity(부모 엔터티)는 대상이 될 수 없습니다. `ancestor` 키워드로 정의합니다. 이 association 이 있으면 authorization master, lock master, etag master entity 까지 가는 경로를 암묵적으로 알아낼 수 있어서 그 entity 들을 따로 정의하지 않아도 됩니다. 관련 항목: [[abenbdl_ancestor_ext]]

### association implementation type (association 구현 유형)

association 용 작업을 어느 RAP BO provider 가 구현하는지 정합니다. `managed` 와 `unmanaged` 두 가지가 있습니다. 관련 항목: [[abenbdl_assoc_impl_type]]

## B

### base BDEF (기반 BDEF)

projection 의 바탕이 되는 RAP behavior definition 입니다. projected BDEF(projection 대상 BDEF)와 같은 말입니다. 구현 유형은 managed 나 unmanaged 일 수 있습니다.

### base BDEF extension (기반 BDEF 확장)

managed 또는 unmanaged RAP behavior definition 을 확장하는 개발 객체입니다. `extension` 문으로 만듭니다. 관련 항목: [[abenbdl_extension_syntax]]

### BDEF alternative key (BDEF 대체 키)

사용자가 직접 정의하는 BDEF 키입니다. 바탕이 되는 CDS 데이터 모델의 기본 키, 그리고 BDEF derived type 에 미리 들어 있는 보조 테이블 키와는 별도로 존재합니다. BDEF 순수 키와 BDEF 보조 키 두 종류가 있습니다. RAP key function 의 시그니처를 정할 때처럼 쓰입니다. 관련 항목: [[abenbdl_define_key]]

### BDEF derived type (BDEF 파생 타입)

RAP 프레임워크가 behavior definition 에서 끌어내 만든 내부 테이블 타입 또는 구조 타입입니다. RAP BO consumer 와 RAP BO provider 가 데이터를 주고받을 때 이 타입의 내부 테이블과 구조를 씁니다. 그래서 RAP BO 동작을 구현하는 메서드의 매개변수는 BDEF derived type 으로 정해집니다. ABAP 프로그램에서도 이 타입으로 내부 테이블이나 구조를 선언해 handler class 와 saver class 의 매개변수에 넘길 수 있습니다. 관련 항목: [[abenrpm_derived_types]]

### BDEF extension (BDEF 확장)

RAP behavior definition 을 확장하는 리포지토리 객체입니다. base BDEF(기반 BDEF) extension(확장), BDEF projection extension, abstract BDEF extension 세 종류가 있습니다. BDEF extension 을 또 다른 BDEF extension 으로 넓힐 수도 있는데, 이것을 extension 겹치기(extension layering)라고 합니다. 관련 항목: [[abenbdl_extension]]

### BDEF extension header (BDEF 확장 머리말)

BDEF extension 의 맨 앞 한 줄에서 세 줄까지를 차지하는 BDL 소스 코드 부분입니다. `extension` 으로 시작합니다. 구현 클래스를 정하거나 BDEF privileged mode 를 켜는 내용이 더 들어갈 수 있습니다. 관련 항목: [[abenbdl_extension_header]]

### BDEF friend (BDEF 프렌드)

원본 BDEF의 모든 구성요소에 제한 없이 접근할 수 있는 구현이 딸린 BDEF extension 입니다. 예를 들어 내부 RAP BO 작업을 부를 수 있고, `IN LOCAL MODE` 로 RAP BO entity 를 읽거나 바꿀 수 있습니다. 선택 추가 구문 `with friends` 로 선언합니다. 구현을 여러 조각으로 나눌 때 쓸 수 있습니다. 관련 항목: [[abenbdl_with_friends]]

### BDEF implementation type (BDEF 구현 유형)

RAP behavior definition 의 종류입니다. managed, unmanaged, interface, projection, abstract 다섯 가지가 있습니다. 바탕이 되는 CDS entity 의 종류가 다르고, behavior implementation 이 얼마나 표준으로 주어지고 얼마나 직접 써야 하는지가 다릅니다. 관련 항목: [[abenbdl_impl_type]]

### BDEF privileged mode

RAP BO consumer 가 RAP authorization control(권한 제어) 같은 권한 확인을 건너뛸 수 있게 하는 모드입니다. RAP BO를 사용할 때 EML에서 추가 구문 `PRIVILEGED` 를 쓰려면 이 모드가 먼저 켜져 있어야 합니다. 관련 항목: [[abenbdl_privileged_mode]], [[abapeml_privileged]]

### BDEF projection extension (BDEF projection 확장)

RAP projection behavior definition 을 확장하는 개발 객체입니다. `extension for projection` 문으로 만듭니다. 관련 항목: [[abenbdl_extensibility_projection]]

### BDEF projection extension header (BDEF projection 확장 머리말)

BDEF projection extension 에서 `extension for projection` 으로 시작하는 부분입니다. 관련 항목: [[abenbdl_extension_for_projection]]

### BDEF pure key (BDEF 순수 키)

`define pure key` 로 정의한 BDEF 대체 키입니다. 관련 항목: [[abenbdl_define_key]]

### BDEF secondary key (BDEF 보조 키)

`define secondary key` 로 정의한 BDEF 대체 키입니다. 관련 항목: [[abenbdl_define_key]]

### BDEF strict mode

RAP behavior definition 에 문법 검사를 더 거는 모드입니다. 낡은 문법을 쓰지 않았는지, 암묵적으로 쓸 수 있는 작업을 명시적으로 선언했는지, RAP BO가 모범 사례를 따르는지 등을 확인합니다. 검사를 더 보탠 엄격한 버전이 계속 추가됩니다. 관련 항목: [[abenbdl_strict]]

### BDL source code (BDL 소스 코드)

RAP BDL로 쓴 RAP behavior definition 의 소스 코드입니다.

### BOPF-based RAP business object (BOPF 기반 RAP 비즈니스 객체)

줄임말 BOPF-based RAP BO. CDS base BO(기반 BO)PF business object 를 RAP business object 로 옮긴 결과물입니다. 전용 문법으로 `managed by BOPF` 와 `with BOPF draft` 가 있습니다. transactional buffer 는 BOPF-managed RAP BO provider 가 제공하고, draft 를 쓰는 경우에는 BOPF-managed RAP draft provider 가 draft 를 처리합니다.

### BOPF-managed RAP BO provider (BOPF-managed RAP BO 제공자)

RAP BO provider 가운데 BOPF 기반 RAP BO의 transactional buffer 를 제공하는 부분입니다.

### BOPF-managed RAP draft provider (BOPF-managed RAP draft 제공자)

BOPF가 draft 를 관리하는 BOPF 기반 RAP BO의 draft provider 입니다. draft 처리는 BOPF(Business Object Processing Framework)가 맡습니다.

## C

### CCIMP include (CCIMP 인클루드)

클래스 풀에 속한 인클루드 프로그램으로, 전역 클래스의 선언부 뒤와 구현부 앞에 끼워집니다. Class Builder 에서는 Local Definitions/Implementations 로, ADT 에서는 Local Types 로 들어가 편집합니다. 인클루드 프로그램의 내부 이름이 `CCIMP` 로 끝납니다. CCDEF 인클루드도 함께 참고합니다.

### CDS parent entity (CDS 부모 엔터티)

CDS 구성 트리 안에서 자식으로 가는 association(to-child association)로 child entity(자식 엔터티)를 정의하는 CDS entity 입니다. parent entity 하나에 child entity 가 여럿 있을 수 있습니다. child entity 는 저마다 to-parent association 을 정의하고 노출해야 합니다.

### CDS root entity (CDS 루트 엔터티)

CDS 구성 트리의 맨 위에 있는 CDS entity 입니다. CDS DDL로 정의할 때 추가 구문 `ROOT` 를 반드시 적습니다. root entity 하나는 정확히 하나의 RAP BO에만 속할 수 있습니다. 보통 CDS parent entity 이기도 하고, RAP에서는 보통 RAP BO root entity 로 쓰입니다.

### CDS SDL (CDS 서비스 정의 언어)

ABAP CDS의 service definition(서비스 정의) 언어(Service Definition Language)입니다. SDL 소스 코드로 CDS service definition 을 쓰는 데 필요한 언어 요소가 들어 있습니다.

### CDS service definition extension (CDS 서비스 정의 확장)

CDS SDL 문 `EXTEND SERVICE` 로 만드는, 전송할 수 있는 CDS service definition extension 입니다. 원래 service definition 을 고치지 않고도 entity 를 더 넣을 수 있습니다.

### CDS virtual element (CDS 가상 요소)

CDS DDL aspect 또는 projection 뷰의 요소 목록에 있는 요소입니다. projection 뷰에서는 projection 대상 entity 에 들어 있지 않은 요소입니다. 데이터베이스에 저장되지 않고 실행 중에 계산되며, 계산은 보통 ABAP 클래스에서 합니다. projection 뷰의 가상 요소를 채우고 해석하려면 RAP 쿼리 엔진 같은 전용 프레임워크가 끼어야 합니다.

### CDS-based BOPF business object (CDS 기반 BOPF 비즈니스 객체)

줄임말 CDS-based BOPF BO. BOPF(Business Object Processing Framework)에서 말하는 business object 입니다. ABAP programming model for SAP Fiori 로 만듭니다.

### change document object (change documents 객체)

SAP change documents 솔루션에 속하는 리포지토리 객체입니다. 자기에게 배정된 데이터베이스 테이블의 change documents 생성을 관리하고, business object 를 이루는 테이블에 일어난 변경을 기록하도록 돕습니다. RAP business object 에서는 RAP change documents 기능으로 저장된 BO 데이터의 변경을 기록할 때 씁니다.

### change documents-enabled RAP BO entity (change documents 를 쓰는 RAP BO 엔터티)

RAP change documents 로 변경 기록을 남길 수 있는 RAP BO entity 입니다. change documents 마스터 entity 이거나 change documents 종속 entity 입니다.

### controlled SAP LUW (통제된 SAP LUW)

SAP LUW 개념을 넓힌 것으로, 트랜잭션 일관성을 깨는 동작을 찾아내는 검사 장치를 더했습니다. RAP 같은 새 ABAP 개념에서는 자동으로, 암묵적으로 지원됩니다. RAP이 아닌 트랜잭션에서는 `CL_ABAP_TX` 클래스의 static 메서드로 트랜잭션 단계를 명시적으로 설정해서 씁니다. 릴리스된 API에는 `IF_ABAP_TX...` 로 시작하는 분류가 붙을 수 있고, 이 분류에 따른 트랜잭션 계약을 트랜잭션 단계에서 검사합니다.

### cross-BO association

RAP business object 의 구성 트리에 속하지 않고, 다른 business object 에 속한 entity 를 대상으로 하는 association 입니다. 반대말은 BO 내부 association(intra-BO association)입니다.

### CRUD operations (CRUD 작업)

Create, Read, Update, Delete 의 머리글자로, 데이터를 영구 저장할 때 쓰는 네 가지 기본 작업입니다. SQL에서는 DQL 문 `SELECT`, `WITH`, `OPEN CURSOR`, `FETCH` 와 DML 문 `INSERT`, `UPDATE`, `DELETE` 가 이 작업을 맡습니다. RAP에서는 behavior definition 에 BDL 문법 요소 `create`, `read`, `update`, `delete` 로 지정합니다.

### CUD operations (CUD 작업)

Create, Update, Delete 의 머리글자로, CRUD 네 작업 가운데 읽기를 뺀 세 가지입니다. SQL에서는 DML 문 `INSERT`, `UPDATE`, `DELETE` 가 맡습니다. RAP에서는 RAP BO의 변경 작업인 생성, 수정, 삭제가 이 세 작업입니다.

## D

### draft-enabled RAP business object (draft 를 쓰는 RAP 비즈니스 객체)

RAP draft 처리를 지원하는 RAP BO입니다. BDL 추가 구문 `with draft` 또는 `with collaborative draft` 를 적으면 draft 를 쓰는 BO가 됩니다. 관련 항목: [[abenbdl_with_draft]], [[abenbdl_with_coll_draft]]

## E

### EML (엔터티 조작 언어)

→ **ABAP Entity Manipulation Language (ABAP entity 조작 언어)** 를 보세요.

### entity behavior body (엔터티 동작 본문)

entity behavior definition 에서 중괄호 안에 쓰는 부분입니다. RAP BO 작업, validation, determination 같은 요소를 담습니다. 관련 항목: [[abenbdl_body]]

### entity behavior characteristics (엔터티 동작 특성)

entity behavior definition 에서 `define behavior for` 뒤, 중괄호 앞에 오는 부분입니다. entity 단위로 behavior definition 의 속성을 더 정합니다. 관련 항목: [[abenbdl_character]]

### entity behavior definition (엔터티 동작 정의)

behavior definition(BDEF)를 이루는 구성 부분입니다. BDEF는 머리말과, RAP BO root entity 를 가리키는 entity behavior definition 적어도 하나로 이루어집니다. child entity 를 가리키는 entity behavior definition 은 필요할 때만 더 씁니다. 관련 항목: [[abenbdl_define_beh]]

## F

### foreign key association (외래 키 association)

→ **source-resolved association (소스 해석 association)** 를 보세요.

### foreign key RAP business object (외래 키 RAP 비즈니스 객체)

BO 간 시나리오에서, 연관된 비외래 키 BO의 기본 키 또는 `%pid` 를 자기 쪽에 담고 있는 RAP business object 입니다. 관련 항목: [[abapderived_types_pid]]

## I

### input help (입력 도움말)

사용자 화면의 입력 필드에 도움말로 뜨는 값 목록입니다. 값 도움말(value help)이라고도 합니다. 입력 값을 미리 정해 둔 값 가운데서 골라야 할 때 유용합니다. UI 기술에 따라, 입력 필드의 아이콘을 누르거나 F4 키를 누르면 대화 상자로 뜨기도 합니다.

### instance RAP BO operation (인스턴스 RAP BO 작업)

RAP BO entity 인스턴스 하나에 묶여 실행되는 RAP BO 작업입니다.

### internal RAP BO operation (내부 RAP BO 작업)

같은 BO의 RAP BO provider 만 실행할 수 있는 RAP BO 작업입니다. 관련 항목: [[abenbdl_internal]]

### intra-BO association (BO 내부 association)

RAP business object 의 구성 트리에 속하고, 같은 RAP BO 안의 entity 를 대상으로 하는 CDS association 입니다. 반대말은 cross-BO association 입니다.

## L

### leaf entity (리프 엔터티)

RAP business object 의 CDS 구성 트리에서 child entity 가 하나도 없는 CDS entity 입니다. root entity 가 leaf entity(리프 엔터티)일 수도 있습니다.

## M

### managed RAP BO provider (managed RAP BO 제공자)

RAP BO provider 의 한 부분입니다. managed RAP BO의 behavior definition 을 바탕으로 managed transactional buffer 와 managed 동작을 제공합니다.

### managed RAP business object (managed RAP 비즈니스 객체)

줄임말 managed RAP BO. RAP BO의 동작을 제공하는 방식 가운데 하나입니다. transactional buffer 는 managed RAP BO provider 가 제공합니다. 구현의 일부는 behavior pool 에 있는 unmanaged RAP BO provider 가 맡을 수도 있습니다.

### managed transactional buffer (managed 트랜잭션 버퍼)

managed RAP BO의 transactional buffer 로, managed RAP BO provider 가 제공합니다. ABAP 프로그램에서는 ABAP EML로만 접근할 수 있습니다.

### mandatory RAP BO field (필수 RAP BO 필드)

behavior definition 에서 필수로 정한 RAP BO 필드입니다. 생성 요청마다 초기값이 아닌 값을 넘겨야 합니다. 변경 작업에서 초기값으로 되돌릴 수도 없습니다. 관련 항목: [[abenbdl_field_char]]

## N

### non-foreign key RAP business object (비외래 키 RAP 비즈니스 객체)

BO 간 시나리오에서, 자기 기본 키 또는 `%pid` 를 연관된 외래 키 BO가 담고 있는 RAP business object 입니다. 관련 항목: [[abapderived_types_pid]]

## O

### optimistic concurrency control (낙관적 동시성 제어)

여러 사용자가 같은 데이터에 트랜잭션으로 접근하게 하면서, 이미 바뀐 데이터를 모르고 덮어써서 생기는 불일치를 막는 방식입니다. RAP에서는 behavior definition 에 ETag 필드를 써서 보장합니다. 관련 항목: [[abenbdl_etag]]

## P

### payload (페이로드)

통신 기술에서, 두 상대가 주고받는 데이터 패킷 가운데 제어 정보나 프로토콜 정보를 뺀 실제 데이터를 가리킵니다. 음성, 글, 문자, 그림, 소리 등이 여기에 듭니다. RAP business event 에서는 event 를 보내는 쪽이 event 사용자에게 넘기는 데이터를 말합니다. RAP business event 의 페이로드는 출력 매개변수로 정의합니다.

### pessimistic concurrency control (비관적 동시성 제어)

데이터베이스의 같은 데이터를 둘 이상의 사용자가 동시에 바꾸지 못하게 막는 방식입니다. RAP에서는 RAP 잠금 장치가 이것을 보장합니다. 관련 항목: [[abenbdl_locking]]

### prefix extension (접두어 extension)

RAP BO extension 에서 온 요소나 리포지토리 객체를 가리킬 때 용어 앞에 붙이는 말입니다. 예를 들면 extension behavior, extension node, extension field 가 있습니다.

## R

### RAP (ABAP RESTful 애플리케이션 프로그래밍 모델)

→ **ABAP RESTful Application Programming Model (ABAP RESTful 애플리케이션 프로그래밍 모델)** 을 보세요.

### RAP abstract behavior definition (RAP abstract 동작 정의)

줄임말 RAP abstract BDEF 또는 abstract BDEF. 구현 유형이 abstract 인 RAP behavior definition 입니다. CDS abstract entity 를 바탕으로 합니다. 주로 action 이나 function 의 깊은(deep) 매개변수 타입을 정하는 데 씁니다. 관련 항목: [[abenbdl_abstract]]

### RAP action

RAP BO entity 인스턴스의 상태를 바꾸는 RAP BO non-standard operation(비표준 작업)입니다. RAP factory action 과 RAP non-factory action(factory 가 아닌 action)으로 나뉩니다. 관련 항목: [[abenbdl_action]]

### RAP active instance (RAP 활성 인스턴스)

draft 를 쓰는 RAP business object 에서, 커밋하면 persistent table 에 저장되는 RAP BO entity 인스턴스입니다. 이 인스턴스의 BDEF derived type 에서는 draft 표시가 거짓으로 설정됩니다. 생성 작업으로 만들어지거나, draft 시나리오에서 draft action `Activate` 로 만들어집니다.

### RAP additional save

managed RAP BO의 기본 save sequence(저장 순서)에 덧붙이는 저장 로직입니다. behavior definition 머리말에 정의하면 BO 전체에, entity 동작 특성에 정의하면 그 entity 하나에 적용됩니다. 재정의한 saver method(세이버 메서드) `save_modified` 에 구현합니다. 관련 항목: [[abenbdl_saving]], [[abaprap_saver_meth_save_modified]]

### RAP analytical table (RAP 분석 테이블)

SAP Fiori 화면에서 데이터를 보여 주는 방식 가운데 하나입니다. 구조화된 데이터 묶음을 담고, 그 데이터를 여러 방식으로 집계할 수 있습니다. RAP으로 만든 애플리케이션에서 분석용 평가를 할 수 있게 해 줍니다. 모델은 `@OData.applySupportedForAggregation: #FULL` 주석을 단 CDS 뷰를 바탕으로 합니다.

### RAP authorization context

권한 객체를 하나 이상 나열해 담는 그릇입니다. 전체 authorization context 와 확인 생략용 authorization context 두 종류가 있습니다. RAP behavior definition 에서 선택으로 넣는 구성 부분입니다. 관련 항목: [[abenbdl_authorization_context]]

### RAP authorization context for disable (확인 생략용 RAP authorization context)

이 컨텍스트를 활성화했을 때 건너뛸 수 있는 권한 객체를 나열한 RAP authorization context 입니다.

### RAP authorization control (RAP 권한 제어)

권한 없는 데이터 접근에서 RAP BO를 지키는 접근 제한입니다. 데이터 접근이나 작업 실행 허가를 제한합니다. global 권한은 개별 인스턴스와 상관없이 정해지고, instance 권한은 entity 인스턴스의 상태에 따라 정해집니다. 둘 가운데 하나만 쓸 수도, 둘 다 쓸 수도 있습니다. 관련 항목: [[abenbdl_authorization]]

### RAP authorization dependent entity (RAP authorization dependent 엔터티)

자기 authorization master entity 에 정의된 authorization control 을 그대로 쓰는 RAP BO entity 입니다. 권한 요청을 authorization master entity 의 구현에 넘깁니다.

### RAP authorization master entity (RAP authorization master 엔터티)

권한 구현을 스스로 갖춘 RAP BO entity 입니다. 이 entity 나 여기에 딸린 authorization dependent entity 에 접근을 요청할 때 그 구현이 쓰입니다.

### RAP base BO (RAP 기반 BO)

RAP projection BO의 바탕이 되는 RAP business object 입니다. BDEF 구현 유형은 managed 나 unmanaged 일 수 있습니다.

### RAP BDL (RAP 동작 정의 언어)

ABAP RAP의 behavior definition 언어(Behavior Definition Language)입니다. BDL 소스 코드로 RAP behavior definition 을 쓰는 데 필요한 언어 요소가 들어 있습니다. 관련 항목: [[abenbdl]]

### RAP behavior (RAP 동작)

RAP BO가 무엇을 할 수 있는지 나타내는 부분입니다. RAP behavior definition 에서 정의하고 RAP behavior implementation 에서 구현합니다.

### RAP behavior definition (RAP 동작 정의)

줄임말 RAP BDEF 또는 BDEF. RAP business object 에 속한 모든 entity 의 동작을 정의해서 그 BO를 기술합니다. RAP BDL의 언어 요소를 써서 BDL 소스 코드로 씁니다. 관련 항목: [[abencds_bdef]]

### RAP behavior definition header (RAP 동작 정의 머리말)

줄임말 BDEF header. RAP behavior definition 에서 구현 유형과, business object 전체에 적용되는 전역 속성을 정하는 부분입니다. 맨 위에 있으며, entity behavior definition `define behavior for` 앞에 오는 문이 모두 여기에 듭니다. 관련 항목: [[abenbdl_bdef_header]]

### RAP Behavior Definition Language (RAP 동작 정의 언어)

→ **RAP BDL (RAP behavior definition 언어)** 을 보세요.

### RAP behavior extension body (RAP 동작 확장 본문)

entity 동작 extension 에서 `extend behavior for` 문 뒤 중괄호 안에 쓰는 부분입니다. extension determination, extension validation, extension action 같은 새 extension 요소를 정의할 수 있습니다. RAP type mapping 이나 determine action 처럼 이미 있는 요소를 확장할 수도 있습니다. 관련 항목: [[abenbdl_new_elem_ext]], [[abenbdl_ext_elem_ext]]

### RAP behavior implementation (RAP 동작 구현)

unmanaged RAP BO provider 를 구현한 것입니다. ABAP behavior pool(ABP)의 지역 클래스에 씁니다.

### RAP BO augmentation

ABP handler method(핸들러 메서드)로 반드시 구현해야 하는 RAP BO 작업 추가 구문입니다. projection behavior definition 에서 RAP standard operation(표준 작업)에 정의합니다. 변경 요청이 business object projection 에 닿으면 이 구현이 불립니다. 요청이 projection 대상 business object 의 핸들러로 넘어가기 전에 요청에 데이터를 보탭니다. 관련 항목: [[abenbdl_augment_projection]]

### RAP BO consumer (RAP BO 사용자)

RAP BO의 구현을 가져다 쓰는 소프트웨어입니다. AS ABAP 바깥에서 온 요청을 처리하는 RAP 트랜잭션 엔진이거나, ABAP EML을 쓰는 ABAP 프로그램입니다.

### RAP BO contract (RAP BO 계약)

RAP BO provider 와 consumer 의 구현이 지켜야 하는 규칙 모음입니다. 일관성과 신뢰성을 지키려고 둡니다.

### RAP BO determine action

요청을 받으면 determination 과 validation 을 실행하는 RAP action 입니다. 구현은 managed RAP BO provider 가 제공합니다. 관련 항목: [[abenbdl_determine_action]]

### RAP BO draft action

draft 를 쓰는 RAP BO의 수명 주기 동안 draft 인스턴스와 active(활성) 인스턴스의 상태를 관리하려고 부르는 RAP action 입니다. 구현은 RAP managed draft provider 가 제공합니다. 관련 항목: [[abenbdl_draft_action]]

### RAP BO entity (RAP BO 엔터티)

RAP BO 노드(RAP BO node)라고도 합니다. RAP BO의 behavior definition 에서 동작이 정의된 CDS entity 입니다.

### RAP BO entity instance (RAP BO 엔터티 인스턴스)

RAP BO 노드 인스턴스(RAP BO node instance)라고도 합니다. RAP BO entity 에서 키로 식별되는 데이터 한 건입니다. RAP 트랜잭션 동안 interaction phase(상호작용 단계)에서는 transactional buffer 안에서 처리됩니다. 그 뒤 save sequence 에서 데이터베이스 테이블에 저장됩니다.

### RAP BO extension (RAP BO 확장)

RAP BO를 확장하는 리포지토리 객체입니다. DDIC DDL로 정의하는 DDIC extension, CDS DDL로 쓰는 CDS entity extension, RAP BDL로 쓰는 BDEF extension, CDS SDL로 쓰는 service definition extension 이 있습니다.

### RAP BO field (RAP BO 필드)

RAP BO entity 의 요소입니다.

### RAP BO instance (RAP BO 인스턴스)

BO 구성 트리에서 나온 데이터 한 벌입니다. RAP BO root entity 인스턴스가 적어도 하나 들어 있습니다. 그 root entity 인스턴스와 composition 으로 이어진 entity 인스턴스도 모두 포함합니다.

### RAP BO instance key component group (RAP BO 인스턴스 키 구성요소 묶음)

BDEF derived type 에서 RAP BO 인스턴스의 기본 키 필드를 담는 구성요소 묶음입니다. `%key`, `%tky`, `%pky` 가 있습니다. 관련 항목: [[abapderived_types_key]], [[abapderived_types_tky]]

### RAP BO interface

바깥에서 안정적으로 쓰도록 interface 구실을 하는 RAP business object 입니다. CDS 트랜잭션 interface 와 RAP interface behavior definition 으로 이루어집니다. 런타임 핸들러가 없고, behavior implementation 용 클래스를 지정할 수도 없습니다. 밑에 있는 RAP BO의 동작을 projection 만 할 수 있습니다. 관련 항목: [[abenbdl_rap_bo_interface]]

### RAP BO interface entity (RAP BO interface 엔터티)

RAP BO interface 의 구성 부분입니다. RAP 데이터 모델 가운데 interface 에 넣을 부분을 나타냅니다. 프로바이더 계약이 `TRANSACTIONAL_INTERFACE` 인 CDS projection 뷰로 표현됩니다.

### RAP BO non-standard operation (RAP BO 비표준 작업)

RAP BO에 표준 트랜잭션 동작을 주지 않는 RAP BO 작업입니다. action 과 function 이 그 예입니다. non-standard operation 은 대부분 ABAP behavior pool 에 직접 구현해야 합니다. 관련 항목: [[abenbdl_nonstandard]]

### RAP BO operation (RAP BO 작업)

RAP BO가 제공하는 작업으로, RAP BO에는 이 작업으로 접근합니다. CRUD 작업, non-standard operation, 잠금 작업, association 용 작업이 있습니다. 작업의 구현은 transactional buffer 에 접근해서 RAP BO 동작을 실현합니다. RAP BO 메서드의 매개변수는 주로 BDEF derived type 으로 정해집니다. 관련 항목: [[abenbdl_operations]]

### RAP BO precheck

RAP handler method 로 반드시 구현해야 하는 RAP BO 작업 추가 구문입니다. 기반 business object 의 behavior definition 이나 projection business object 에서 작업에 정의합니다. 구현 메서드는 변경 요청이 transactional buffer 에서 실행되기 전에 불립니다. 원치 않는 변경이 transactional buffer 에 닿지 않게 막는 것이 목적입니다. 관련 항목: [[abenbdl_precheck]]

### RAP BO provider (RAP BO 제공자)

behavior definition 을 바탕으로 RAP BO의 transactional buffer 와 구현을 제공하는 소프트웨어입니다. managed RAP BO는 managed RAP BO provider 가 전부 또는 일부를 제공하고, unmanaged RAP BO는 unmanaged RAP BO provider 가 전부 제공합니다. draft 를 쓰는 BO의 draft 데이터는 managed 또는 unmanaged draft provider 가 제공합니다. BOPF 기반 RAP BO는 BOPF-managed RAP BO provider 가 제공합니다.

### RAP BO root entity (RAP BO 루트 엔터티)

CDS root entity 의 동작을 정의하는 RAP BO entity 입니다. RAP business object 의 계층 구조에서 맨 위에 있으며, 그 RAP business object 를 대표합니다.

### RAP BO service projection (RAP BO 서비스 projection)

RAP 비즈니스 서비스에 쓰려고 만든 RAP BO projection 입니다. CDS 트랜잭션 쿼리와 RAP projection behavior definition 으로 이루어집니다.

### RAP BO service projection entity (RAP BO 서비스 projection 엔터티)

RAP BO 서비스 projection 의 구성 부분입니다. 서비스 projection 에 넣을 RAP 데이터 모델을 나타냅니다. 프로바이더 계약이 `TRANSACTIONAL_QUERY` 인 CDS projection 뷰로 표현됩니다.

### RAP BO standard operation (RAP BO 표준 작업)

RAP BO에 표준 트랜잭션 동작을 주는 RAP BO 작업입니다. 생성, 읽기, 수정, 삭제(CRUD)와 잠금이 standard operation 입니다. managed RAP BO에서는 managed RAP BO provider 가 standard operation 을 제공할 수 있습니다. 이와 달리 action 과 function 은 애플리케이션마다 다른 non-standard operation 입니다. 대부분 behavior pool 에 직접 구현하지만, determine action 과 draft action 처럼 provider 가 구현을 대 주는 action 도 있습니다. 관련 항목: [[abenbdl_standard_operations]]

### RAP buffer data (RAP 버퍼 데이터)

RAP transactional buffer 에 있는 데이터입니다. active 상태이거나 draft 상태입니다.

### RAP business event

보통 RAP BO entity 에서 일어난 CUD 작업의 결과를 알리는 business event 입니다. 예를 들어 RAP BO entity 인스턴스를 만들면 event 가 발생하고, 이 event 를 구독한 쪽이 받아서 처리합니다. 넘어가는 정보(페이로드)에는 인스턴스 키가 항상 들어 있고, 필요하면 어떤 작업(CUD)이었는지 같은 정보가 더 들어갑니다. RAP 파생 event 와 side effects 용 RAP business event 는 특별한 종류의 RAP business event 입니다. 관련 항목: [[abenbdl_event]]

### RAP business event for side effects (side effects 용 RAP business event)

추가 구문 `for side effects` 를 붙여 정의한 RAP business event 입니다. event 기반 side effects 를 일으키는 용도로만 쓰도록 정의합니다. 관련 항목: [[abenbdl_event_side_effect]]

### RAP business object (RAP 비즈니스 객체)

줄임말 RAP BO. ABAP RAP에서 말하는 business object 입니다. behavior definition 이 계층을 이루는 CDS entity 묶음에 작업과 특성으로 동작을 정하고, transactional buffer 에 있는 데이터는 RAP BO 작업으로 다룹니다. managed RAP BO, unmanaged RAP BO, BOPF 기반 RAP BO가 있습니다. AS ABAP 바깥에서는 RAP 비즈니스 서비스로 노출해 RAP 트랜잭션 엔진이 사용하고, AS ABAP 안에서는 EML로 접근합니다. 관련 항목: [[abenbdl_rap_bo]]

### RAP business object behavior (RAP 비즈니스 객체 동작)

RAP behavior definition 에 정의된 RAP business object 의 트랜잭션 동작입니다. entity 동작 특성, RAP BO 작업, validation, determination 이 여기에 듭니다. 이것들은 managed RAP BO provider 가 제공하거나, ABAP behavior pool(unmanaged RAP BO provider)에 구현합니다.

### RAP business service (RAP 비즈니스 서비스)

줄임말 RAP BS. RAP business object 를 사용하게 해 주는 RESTful 비즈니스 서비스입니다. OData 프로토콜로 공개합니다.

### RAP change documents

entity behavior definition 에 선택으로 넣는 부분으로, change documents 를 쓰는 RAP BO entity 에서 저장된 RAP BO 데이터의 변경 기록을 켭니다. 켜 두면 변경 내용이 change documents 객체에 기록됩니다. RAP 재사용 서비스 가운데 하나입니다. 관련 항목: [[abenbdl_change_documents]]

### RAP change documents dependent entity (RAP change documents 종속 엔터티)

change documents 를 쓰는 RAP BO entity 가운데, 자기 change documents 마스터 entity 에 정의된 change documents 객체를 써서 저장된 데이터의 변경을 기록하는 entity 입니다.

### RAP change documents master entity (RAP change documents 마스터 엔터티)

change documents 를 쓰는 RAP BO entity 가운데, 저장된 데이터의 변경을 기록할 change documents 객체를 스스로 갖춘 entity 입니다.

### RAP cleanup phase (RAP 정리 단계)

RAP save sequence 의 마지막 단계입니다. 이 단계에서 RAP saver method `cleanup` 이 불립니다. 관련 항목: [[abensaver_method_cleanup]]

### RAP collaborative draft

여러 사용자가 같은 draft 인스턴스를 동시에 작업할 수 있는 RAP draft 처리 방식입니다. draft action `Share` 로 초대받은 권한 있는 사용자는 서로를 잠그지 않고 함께 고치고, 바뀐 내용을 실시간으로 봅니다. draft 인스턴스를 만든 사람과 다른 권한 있는 사용자 모두 draft 를 수정, 활성화, 폐기할 수 있습니다. 관련 항목: [[abenbdl_with_coll_draft]]

### RAP concurrency control (RAP 동시성 제어)

여러 작업이 동시에 일어나도 결과가 올바르도록 보장하는 RAP의 개념입니다. 낙관적 동시성 제어와 비관적 동시성 제어를 함께 참고합니다.

### RAP consumer hint (RAP 사용자 힌트)

RAP feature control(기능 제어)나 권한에서 끌어내, 선택한 프로토콜에 실어 사용자 쪽에 전달하는 RAP BO field characteristics(필드 특성) 또는 동작 특성입니다. 비즈니스 서비스를 더 쓰기 편하게 하려는 것입니다. 예를 들어 화면에서 mandatory 필드에 별표가 붙거나, readonly 필드가 회색으로 보이게 됩니다.

### RAP content identifier (RAP 콘텐츠 식별자)

인스턴스 하나에 하는 작업 하나를 고유하게 가리키는 RAP 입력 식별자입니다. derived type 구성요소 `%cid` 에 담깁니다. static 작업을 쓸 때, 인스턴스 식별자로 식별되기 전 단계의 인스턴스를 가리킵니다. 관련 항목: [[abapderived_types_cid]]

### RAP copy action (RAP 복사 action)

편집할 수 있는 트리 뷰 시나리오에서 계층 노드를 어떻게 복제할지 정하는 RAP 계층 action 입니다. 이미 있는 노드를 바탕으로 새 계층 노드를 만들 때 유용합니다. factory action 이므로 결과 인스턴스에 `%cid` 를 쓸 수 있습니다. 구현은 직접 합니다. 관련 항목: [[abenbdl_copy_action]]

### RAP create operation (RAP 생성 작업)

RAP BO entity 의 인스턴스를 새로 만드는 RAP 변경 작업입니다.

### RAP create-by-association operation (RAP association 생성 작업)

연관된 business object entity 의 인스턴스를 새로 만드는 RAP 변경 작업입니다.

### RAP data model (RAP 데이터 모델)

RAP BO에서 쓰는 데이터를 정의하는 부분입니다. CDS 구성 트리로 서로 이어진 RAP BO entity 로 이루어집니다.

### RAP data model extension (RAP 데이터 모델 확장)

RAP BO의 데이터 모델을 확장한 것입니다. DDIC extension 과 CDS entity extension 으로 이루어질 수 있습니다.

### RAP default values function

사용자 화면에서 RAP BO 작업의 필드 값이나 입력 매개변수에 기본값을 채워 주는 RAP BO 작업 추가 구문입니다. ABP handler method 로 반드시 구현해야 합니다. 관련 항목: [[abenbdl_default_function]], [[abenbdl_operations_additions]]

### RAP delete operation (RAP 삭제 작업)

RAP BO entity 인스턴스를 지우는 RAP 변경 작업입니다.

### RAP dependent BO (RAP 종속 BO)

BO 간 시나리오에서 잠금, 허가 처리, 삭제를 호스트 BO에 맡기는 RAP BO입니다. 호스트 BO와 연관되면 composition 과 비슷한 관계가 생깁니다. BDEF 머리말에 `dependent` 문법을 씁니다.

### RAP dependent draft BO (RAP 종속 draft BO)

cross-BO association 시나리오에서 draft 관리를 연관된 주 draft BO에 맡기는, draft 를 쓰는 RAP business object 입니다. 주 draft BO의 연관된 인스턴스가 draft 가 될 때만 이 BO의 인스턴스도 draft 가 될 수 있습니다. projection 뷰 BDEF의 머리말에 `use draft as dependent` 문법을 씁니다.

### RAP derived event (RAP 파생 event)

이미 있는 RAP business event 의 페이로드를 다시 정의한 event 입니다. 이미 구현된 event 를 참조해서 정의하고, 참조한 event 와 다른 페이로드를 정할 수 있습니다. 참조한 event 가 발생하면 파생 event 도 자동으로 발생합니다. ABAP behavior pool 에 구현할 것은 없습니다.

### RAP determination

RAP BO 동작에 선택으로 넣는 부분으로, 발동 조건이 맞으면 RAP BO 인스턴스를 바꿉니다. 관련 항목: [[abenbdl_determinations]]

### RAP draft handling (RAP draft 처리)

transactional buffer 의 내용을 중간 저장소(draft 테이블)에 저장해서, 트랜잭션이 여러 ABAP 세션에 걸쳐 이어질 수 있게 하는 RAP의 개념입니다. behavior definition 머리말에 `with draft` 또는 `with collaborative draft` 키워드를 써서 시작합니다. 관련 항목: [[abenbdl_draft_handling]]

### RAP draft indicator (RAP draft 표시)

RAP BO 인스턴스가 draft 인스턴스인지 active 인스턴스인지 알려 주는 BDEF derived type 구성요소입니다. 구성요소 묶음 `%tky` 안에 `%is_draft` 로 들어 있습니다. 관련 항목: [[abapderived_types_is_draft]], [[abapderived_types_tky]]

### RAP draft instance (RAP draft 인스턴스)

draft 를 쓰는 RAP business object 에서, 커밋하면 RAP draft 테이블에 저장되는 RAP BO entity 인스턴스입니다. 이 인스턴스의 BDEF derived type 에서는 draft 표시가 참으로 설정됩니다. 생성 작업으로 만들어지면 새 draft 인스턴스, draft action `Edit` 로 만들어지면 편집 draft 인스턴스입니다. 한 사용자만 편집할 수 있는 exclusive draft 인스턴스와 여러 사용자가 동시에 작업하는 collaborative draft 인스턴스가 있습니다.

### RAP draft query view (RAP draft 조회 뷰)

RAP draft 테이블에서 데이터를 가져오고, 관리용 필드까지 draft 테이블의 모든 필드를 담는 CDS 뷰 entity 입니다. 이제는 권장하지 않는 CDS DDIC 기반 뷰일 수도 있습니다. behavior definition 에서 추가 구문 `query` 로 지정합니다. 이 뷰가 있으면 CDS 데이터 제어 언어(CDS DCL)로 draft 데이터의 읽기 접근 제한을 정할 수 있습니다. 관련 항목: [[abenbdl_draft_query_view]]

### RAP draft scope (RAP draft 범위)

BO 간 시나리오에서, draft 를 쓰는 RAP business object 사이에 draft 를 일관되게 관리하게 해 주는 기능입니다. 서로 연관된 여러 business object 를 하나의 LUW 안에서 편집할 수 있다는 뜻입니다.

### RAP draft table (RAP draft 테이블)

draft 를 쓰는 RAP business object 를 위해 생성되는 DDIC 데이터베이스 테이블입니다. RAP draft 처리에 쓰는 draft 관리 데이터가 들어 있습니다. draft 테이블에는 RAP 프레임워크만 접근해야 합니다. 관련 항목: [[abenbdl_draft_table]]

### RAP dynamic field characteristic (RAP 동적 필드 특성)

RAP BO entity 인스턴스의 상태에 따라 RAP BO 필드의 사용 제한을 정하는 field characteristics 입니다. 예를 들어 필드를 그때그때 readonly, mandatory, 제한 없음으로 정할 수 있습니다.

### RAP early numbering

interaction phase 에서 키 값을 정하는 numbering 방식입니다. 관련 항목: [[abenbdl_early_numb]]

### RAP early save phase (RAP 이른 저장 단계)

RAP save sequence 의 앞 단계입니다. RAP saver method `finalize`, `check_before_save`, `cleanup_finalize` 가 이 단계에 듭니다. 관련 항목: [[abensaver_finalize]], [[abensaver_check_before_save]]

### RAP edit draft instance (RAP 편집 draft 인스턴스)

draft action `Edit` 로 만들어지는 draft 인스턴스입니다. 편집 draft 인스턴스에는 대응하는 active 인스턴스가 나란히 존재합니다. RAP 새 draft 인스턴스도 함께 참고합니다.

### RAP entity behavior extension (RAP 엔터티 동작 확장)

줄임말 behavior extension(동작 extension). BDEF extension 의 구성 부분으로, 이미 있는 RAP BO entity 의 동작을 확장합니다. `extend behavior for EntityName` 으로 정의합니다. 관련 항목: [[abenbdl_extend_beh]]

### RAP entity projection extension (RAP 엔터티 projection 확장)

줄임말 projection extension. BDEF projection extension 의 구성 부분으로, RAP projection behavior definition 에 이미 있는 RAP BO entity 의 동작을 확장합니다. `extend behavior for EntityName` 으로 정의합니다. 관련 항목: [[abenbdl_extend_beh_proj]]

### RAP ETag

ETag 는 entity tag 의 줄임말입니다. RAP ETag 필드는 낙관적 동시성 제어에서 인스턴스의 상태를 나타내는 데 쓰는 RAP BO entity 의 필드입니다. RAP BO entity 인스턴스가 바뀔 때마다 값이 갱신됩니다. 관련 항목: [[abenbdl_etag]]

### RAP ETag dependent entity (RAP ETag 종속 엔터티)

낙관적 동시성 제어에 다른 entity 의 ETag 필드를 쓰는 RAP BO entity 입니다. `etag dependent by _Assoc` 키워드로 정의합니다. 관련 항목: [[abenbdl_etag]]

### RAP ETag master entity (RAP etag master 엔터티)

자기 ETag 필드가 있는 RAP BO entity 입니다. `etag master MasterField` 키워드로 정의합니다. 관련 항목: [[abenbdl_etag]]

### RAP event handler class (RAP event 핸들러 클래스)

RAP event handler method 를 구현하는 데 쓰는 클래스 풀입니다. 관련 항목: [[abenclass_for_events]]

### RAP event handler method (RAP event 핸들러 메서드)

RAP event handler class 의 CCIMP 인클루드에 선언하고 구현하는 메서드입니다. RAP business event 가 발생해 발생한 바로 그 시스템 안에서 소비될 때 실행할 로직을 여기에 씁니다. RAP event handler method 는 비동기로 불립니다. 관련 항목: [[abenmethod_for_entity_event]]

### RAP event-driven side effect (RAP event 기반 side effects)

side effects 용 business event 가 일으키는 RAP side effects 입니다. 그 business event 는 `event MyEvent for side effects` 문법으로, side effects 에만 쓰도록 정의합니다. 관련 항목: [[abenbdl_event]], [[abenbdl_event_side_effect]]

### RAP exclusive draft

draft 인스턴스가 한 사용자에게만 잠기거나 예약되는 RAP draft 처리 방식입니다. draft 인스턴스를 만든 사용자만 수정할 수 있어서 다른 사용자는 같은 draft 를 동시에 편집하지 못합니다. 만든 사람이 유일한 draft 인스턴스 소유자입니다. 소유자만 draft 인스턴스를 수정, 활성화, 폐기할 수 있습니다.

### RAP extensibility (RAP 확장성)

RAP business object 를 알맞은 RAP BO extension 으로 넓히는 일입니다. 확장하려면 먼저 RAP extensibility(확장 허용) 준비로 extension 을 기술적으로 열어 두어야 합니다. 쓰임새로는 필드 extension, 동작 extension, 노드 extension 이 있습니다. 온프레미스와 클라우드 환경 모두에서 개발자 extension 성의 일부로 쓰이며, ABAP for Cloud Development 에서는 C0(extend) 계약에 기대어 extension 지점의 안정성을 보장합니다.

### RAP extensibility enablement (RAP 확장 허용 준비)

RAP business object 가 RAP extension 성에 필요한 기술 요건을 모두 갖추도록 준비하는 일입니다. extension 성 주석으로 RAP 데이터 모델을 준비하고, 전용 extension 지점을 정의해 RAP behavior definition 을 준비하는 작업이 들어갈 수 있습니다. 관련 항목: [[abenbdl_extensibility_enabling]]

### RAP extension entity behavior (RAP 확장 엔터티 동작)

줄임말 node extension(노드 extension). BDEF extension 의 구성 부분으로, extension 노드의 동작을 정의합니다. `define behavior for` 로 정의합니다. extension 노드는 RAP 데이터 모델 extension 으로 현재 RAP BO의 데이터 모델에 추가되어 있어야 합니다. 관련 항목: [[abenbdl_define_beh_extend]]

### RAP extension layering (RAP 확장 겹치기)

BDEF extension 을 또 다른 BDEF extension 으로 넓히는 것을 말합니다. BDEF extension 을 확장하려면 먼저 RAP extensibility 준비로 extension 을 기술적으로 열어 두어야 합니다. 기술적으로 보면 다른 extension 을 확장하는 BDEF extension 도 보통 extension 이며, BDEF extension 의 규칙이 그대로 적용됩니다. 관련 항목: [[abenbdl_extension_layering]]

### RAP external numbering

RAP BO consumer 가 키 값을 넘겨주는 numbering 방식입니다.

### RAP factory action

RAP BO entity 인스턴스를 새로 만드는 RAP action 입니다. BO에 맞는 기본값을 가져오는 일처럼 생성 과정에 기능을 보탤 수 있습니다. factory action 의 BDEF derived type 에는 `%cid` 구성요소가 들어 있습니다. 관련 항목: [[abenbdl_action_factory]], [[abapderived_types_cid]]

### RAP feature control (RAP 기능 제어)

RAP BO consumer 에게 RAP BO 작업을 켜거나 끄고, field characteristics 를 동적으로 정하는 접근 제한입니다. 정적일 수도 동적일 수도 있고, 인스턴스 기준일 수도 전역일 수도 있습니다. 관련 항목: [[abenbdl_actions_fc]]

### RAP field characteristic (RAP 필드 특성)

RAP BO 필드에 접근하는 것을 제한하는 field characteristics 입니다. 정적 field characteristics 와 동적 field characteristics 가 있습니다. 관련 항목: [[abenbdl_field_char]]

### RAP foreign entity (RAP 외부 엔터티)

자기가 정의된 BO의 구성 트리에 속하지 않는 RAP BO entity 입니다. behavior definition 에 외부 entity 를 정의하면 두 BO 사이에 메시지 mapping 을 할 수 있습니다. 관련 항목: [[abenbdl_foreign]]

### RAP framework (RAP 프레임워크)

AS ABAP 에서 ABAP RESTful Application Programming Model(RAP)을 받쳐 주는 프레임워크입니다. RAP 런타임 엔진과 RAP 개발 환경으로 이루어집니다.

### RAP full authorization context (RAP 전체 authorization context)

권한 객체를 담는 그릇 구실을 하는 RAP authorization context 입니다. `define own authorization context` 문법으로 지정합니다. RAP BO의 구현에서 쓰는 권한 객체를 문서로 남기는 구실을 합니다. 관련 항목: [[abenbdl_def_own_auth_context]]

### RAP function

RAP BO entity 인스턴스를 바꾸지 않고 정보만 돌려주는 RAP BO non-standard operation 입니다. 관련 항목: [[abenbdl_function]]

### RAP global feature control (RAP global 기능 제어)

BO entity 인스턴스의 상태와 상관없이 접근 제한을 정하는 feature control 입니다. 작업에만 정의할 수 있습니다.

### RAP handler class (RAP 핸들러 클래스)

ABAP behavior pool(ABP)의 CCIMP 인클루드에 있는 지역 클래스로, RAP handler method 를 구현합니다. RAP interaction phase 에서 실행됩니다. 관련 항목: [[abenabp_handler_class]]

### RAP handler method (RAP 핸들러 메서드)

ABAP behavior pool 의 RAP handler class 에 있는 메서드로, RAP interaction phase 에서 불립니다. draft action 과 augmentation 을 빼면 메서드 이름은 마음대로 지을 수 있습니다. 관련 항목: [[abapmethods_for_rap_behv]]

### RAP hierarchy action (RAP 계층 action)

편집할 수 있는 트리 뷰에서 계층 데이터에 작업을 할 때 쓰는 RAP action 입니다. RAP 복사 action 과 RAP 순서 바꾸기 action 이 있습니다.

### RAP host BO (RAP 호스트 BO)

BO 간 시나리오에서 종속 BO로 가는 association 이 있는 RAP BO입니다. 이 association 은 composition 과 비슷한 관계를 만들고, 호스트 BO가 종속 BO의 잠금, 허가 처리, 삭제를 넘겨받습니다. 종속 BO로 가는 association 에 `to dependent` 문법을 씁니다.

### RAP input derived type (RAP 입력 파생 타입)

ABP 메서드의 가져오기(importing) 매개변수에 쓰는 BDEF derived type 입니다.

### RAP input identifier (RAP 입력 식별자)

ABAP behavior pool 의 구현 메서드로 들어오는 구조입니다. 그 메서드에서 인스턴스 하나를 식별하는 데 필요한 구성요소가 모두 들어 있습니다. 인스턴스 식별자이거나 콘텐츠 식별자이거나, 둘 다일 수 있습니다.

### RAP instance feature control (RAP instance 기능 제어)

필드 하나나 작업 하나에 접근 제한을 정하는 feature control 입니다. 정적일 수도 동적일 수도 있습니다.

### RAP instance identifier (RAP 인스턴스 식별자)

RAP BO 인스턴스를 고유하게 식별하는 구조입니다. 기본 키 필드와, `%is_draft`, `%pid` 처럼 식별에 필요한 derived type 구성요소로 이루어집니다. 구성요소 묶음 `%tky` 또는 `%pky` 로 나타냅니다. RAP 입력 식별자도 함께 참고합니다. 관련 항목: [[abapderived_types_tky]], [[abapderived_types_pky]]

### RAP instance transition message (RAP 인스턴스 전이 메시지)

business object entity 의 인스턴스 하나를 가리키는 transition message(전이 메시지)입니다. 키 참조가 들어 있습니다.

### RAP interaction phase (RAP 상호작용 단계)

RAP BO 런타임 가운데 transactional buffer 의 데이터를 바꾸는 구간입니다.

### RAP interface behavior definition (RAP interface 동작 정의)

줄임말 interface BDEF. RAP BO interface 의 구성 부분으로, interface 에 넣을 동작을 정의합니다. BDEF 구현 유형이 `interface` 인 RAP behavior definition 으로 표현됩니다. 관련 항목: [[abenbdl_rap_bo_interface]]

### RAP internal numbering

RAP BO provider 가 키 값을 정하는 numbering 방식입니다.

### RAP inverse function

association 용 RAP non-standard operation 입니다. 연관 대상 인스턴스의 외래 키 필드 값을 입력으로 받아, 거기에 대응하는 연관 소스 인스턴스를 결과로 돌려줍니다. 예를 들어 BO 간 시나리오에서 association 읽기 작업을 할 수 있게 하는 데 씁니다. 관련 항목: [[abenbdl_inverse_funct]]

### RAP key function

BDEF 대체 키에 정의하는, 미리 정해진 RAP function 입니다. 대체 키의 값을 입력으로 받아 값이 일치하는 entity 인스턴스를 돌려줍니다. 예를 들어 RAP 재사용 객체가 낀 cross-BO association 이 있는 RAP BO에서 association 읽기 작업을 할 수 있게 하는 데 씁니다. 관련 항목: [[abenbdl_keyfunction]]

### RAP late numbering

RAP save sequence 안에서 키 값을 정하는 numbering 방식입니다. 최종 키 값은 RAP saver method `adjust_numbers` 에서야 정해집니다. 관련 항목: [[abenbdl_late_numbering]], [[abensaver_adjust_numbers]]

### RAP late save phase (RAP 늦은 저장 단계)

RAP save sequence 가운데 RAP saver method `adjust_numbers` 와 `save` (또는 `save_modified`)가 드는 단계입니다. 저장이 성공하면 이어서 `cleanup` 메서드가 불립니다. 관련 항목: [[abensaver_adjust_numbers]], [[abensaver_method_save]]

### RAP link action (RAP 연결 action)

association 용 RAP non-standard operation 으로, 외래 키를 설정해서 RAP BO entity 인스턴스 하나를 다른 인스턴스에 잇습니다. BO 내부 association 과 cross-BO association 모두에 정의할 수 있습니다. RAP 연결 해제 action 도 함께 참고합니다. 관련 항목: [[abenbdl_link_unlink_action]]

### RAP lock dependent entity (RAP lock dependent 엔터티)

잠금 요청을 lock master entity 에 넘기는 RAP BO entity 입니다. `lock dependent by _Assoc` 키워드로 정의합니다. 관련 항목: [[abenbdl_locking]]

### RAP lock master entity (RAP lock master 엔터티)

자기에게 딸린 lock dependent entity 어느 하나에 잠금 요청이 와도 함께 잠기는 RAP BO entity 입니다. 잠금 요청이 올 때마다 lock master 와 거기에 딸린 lock dependent entity 가 모두 잠깁니다. 관련 항목: [[abenbdl_locking]]

### RAP lock operation (RAP 잠금 작업)

RAP 트랜잭션 동안 persistent table 의 RAP BO entity 인스턴스를 잠그는 RAP BO 작업입니다.

### RAP locking (RAP 잠금)

SAP 잠금 개념을 바탕으로 한 잠금 장치입니다. 잠금 function module 을 써서 비관적 동시성 제어를 합니다. 관련 항목: [[abenbdl_locking]]

### RAP managed draft provider (RAP managed draft 제공자)

RAP BO provider 의 한 부분입니다. interaction phase 동안 transactional buffer 의 draft 데이터를 관리합니다. draft 를 쓰는 RAP BO에서 draft action 과 전체 ETag 처리도 제공합니다.

### RAP message (RAP 메시지)

interface `IF_ABAP_BEHV_MESSAGE` 를 구현한 클래스의 인스턴스로 나타내는 메시지이며, RAP BO provider 구현에서 씁니다. 애플리케이션마다 자기 클래스를 만들 수 있습니다. 편의를 위해 behavior pool 마다 `CX_NO_CHECK` 를 상속한 지역 예외 클래스 `CL_ABAP_BEHV_MSG` 가 미리 들어 있고, 이 클래스는 `IF_ABAP_BEHV_MESSAGE` 를 최소한으로 구현합니다. RAP 메시지에도 쓸 수 있고, 알맞은 곳에서 예외를 일으키는 데도 쓸 수 있습니다.

### RAP modify operation (RAP 변경 작업)

CUD 작업과 같은 말입니다. RAP BO entity 인스턴스의 데이터를 바꾸는 RAP BO 작업입니다. 생성, 수정, 삭제가 RAP 변경 작업입니다.

### RAP new draft instance (RAP 새 draft 인스턴스)

draft 표시를 참으로 두고 생성 작업을 해서 만든 draft 인스턴스입니다. 새 draft 인스턴스의 데이터는 아직 active 데이터베이스 테이블에 저장되지 않았고, 대응하는 active 인스턴스도 없습니다. RAP 편집 draft 인스턴스도 함께 참고합니다.

### RAP non-factory action

factory action 이 아닌 RAP action 입니다. factory action 과 달리, non-factory action 의 BDEF derived type 에는 `%cid` 구성요소가 없습니다. 다만 `repeatable` 로 정의한 repeatable action 의 derived type 에는 `%cid` 가 들어 있습니다. 관련 항목: [[abenbdl_action_nonfactory]]

### RAP nonstandard operation for associations (association 용 RAP 비표준 작업)

연관 소스에서 연관 대상으로 가는 연관 경로를 따라 표준이 아닌 동작을 하는 association 용 작업입니다. 연결 action, 연결 해제 action, 순서 바꾸기 action, inverse function 이 미리 정해진 association 용 non-standard operation 입니다. 관련 항목: [[abenbdl_assoc_nonstand_ops]]

### RAP numbering

RAP BO entity 인스턴스의 기본 키 필드에 값을 정하는 일을 다루는 개념입니다. early numbering, external numbering, internal numbering, late numbering 이 있습니다.

### RAP operation for associations (association 용 RAP 작업)

연관 경로를 따라 실행되어 연관 대상에 영향을 주는 RAP BO 작업입니다. RAP behavior definition 에서 association 에 정의합니다. association 용 standard operation 과 association 용 non-standard operation 이 있습니다.

### RAP output derived type (RAP 출력 파생 타입)

ABP 메서드의 변경(changing) 매개변수에 쓰는 BDEF derived type 입니다.

### RAP persistent data (RAP 영구 데이터)

RAP persistent table 에 있는 데이터입니다.

### RAP persistent state (RAP 영구 상태)

business object 또는 그 인스턴스가 영구 데이터베이스 테이블에 들어 있는 그대로의 상태입니다.

### RAP persistent table

RAP BO가 바탕으로 삼는 DDIC 데이터베이스 테이블입니다. persistent table 의 데이터를 트랜잭션으로 바꾸려면 데이터를 transactional buffer 에 올립니다. RAP 트랜잭션이 끝날 때 transactional buffer 의 변경 내용은 persistent table 에 다시 쓰이거나(커밋) 버려집니다(롤백). 관련 항목: [[abenbdl_persistent_table]]

### RAP principal draft BO (RAP 주 draft BO)

cross-BO association 시나리오에서, 자기 인스턴스의 draft 상태를 종속 draft BO의 연관된 인스턴스에 그대로 넘겨주는, draft 를 쓰는 RAP business object 입니다. 연관된 인스턴스가 모두 함께 draft 가 되고 함께 활성화됩니다. projection BDEF의 cross-BO association 에 `with dependent draft` 문법을 씁니다.

### RAP projection behavior definition (RAP projection 동작 정의)

줄임말 RAP projection BDEF 또는 projection BDEF. 구현 유형이 `projection` 인 RAP behavior definition 입니다. CDS 트랜잭션 쿼리를 바탕으로 하고, base BDEF 를 비춥니다. 관련 항목: [[abenbdl_projection_bo]]

### RAP projection business object (RAP projection 비즈니스 객체)

RAP projection behavior definition 으로 정의한 RAP business object 입니다. 루트 뷰가 CDS projection 뷰입니다.

### RAP projection extension entity (RAP projection 확장 엔터티)

projection 층에서 노드 extension 을 정의하는, BDEF projection extension 의 구성 부분입니다. projection 층에 있는 extension 노드의 동작을 정의합니다. BDEF projection extension 안에서 `define behavior for` 로 정의합니다. extension 노드는 RAP 데이터 모델 extension 으로 현재 RAP BO의 데이터 모델에 추가되어 있어야 합니다. 관련 항목: [[abenbdl_proj_ext_entity]]

### RAP query (RAP 쿼리)

CDS entity 에 정의된 데이터를 readonly 로 쓰게 해 주는 RAP의 사용 방식입니다. RAP 쿼리 엔진이 실행합니다.

### RAP query engine (RAP 쿼리 엔진)

RAP 런타임 엔진 가운데 RAP BO를 트랜잭션 없이 사용하는 경우를 처리하는 부분입니다. RAP 프레임워크가 제공하지만, unmanaged 쿼리를 구현해서 바꿀 수 있습니다.

### RAP read operation (RAP 읽기 작업)

RAP BO entity 인스턴스의 데이터를 가져오는 RAP BO 작업입니다. RAP transactional buffer 에서 읽고, 인스턴스가 transactional buffer 에 없으면 데이터베이스 테이블에서 읽습니다. CRUD 작업도 함께 참고합니다.

### RAP read-by-association operation (RAP association 읽기 작업)

RAP BO entity 의 연관 대상에서 데이터를 가져오는 RAP 읽기 작업입니다.

### RAP recommendation (RAP recommendations)

SAP Fiori 화면의 RAP 애플리케이션에서 입력 필드에 넣을 값을 제안하는 입력 보조 기능입니다. 사용자의 입력과 상호작용 이력을 바탕으로 제안합니다. 생성형 AI로 구현할 수도 있고, RAP business object 의 behavior pool 에 결정적 규칙으로 구현할 수도 있습니다. SAP Fiori 에서는 입력 보조 유형의 recommendations 패턴으로 드러납니다. 관련 항목: [[abenbdl_recommendations]]

### RAP reorder action (RAP 순서 바꾸기 action)

편집할 수 있는 트리 뷰 시나리오에서 계층 노드를 형제들 사이의 정해진 자리로 옮기는 RAP 계층 action 입니다. 모든 형제 인스턴스의 계층 인덱스 필드를 다시 계산해서 옮깁니다. managed 일 수도 unmanaged 일 수도 있습니다. 관련 항목: [[abenbdl_reorder_action]]

### RAP repeatable operation (RAP repeatable 작업)

같은 ABAP EML 요청 또는 같은 OData 요청 안에서 같은 RAP BO entity 인스턴스에 여러 번 실행할 수 있는 RAP action 또는 RAP function 입니다. BDEF derived type 에 `%cid` 구성요소가 들어 있습니다. RAP response parameter(응답 매개변수)는 실행할 때마다 따로 채워집니다. 관련 항목: [[abenbdl_action_repeatable]]

### RAP response (RAP 응답)

RAP BO provider 가 RAP handler method 와 saver method 의 response parameter `mapped`, `failed`, `reported` 에 담아 RAP BO consumer 에게 주는 정보입니다. `mapped` 는 내용 ID(`%cid`)에 어떤 키 값이 만들어졌는지 같은 RAP BO 인스턴스의 mapping 정보를 줍니다. `failed` 는 RAP 작업에서 오류가 난 데이터 건을 알려 줍니다. `reported` 는 BDEF에 정의된 entity 별 오류 메시지와 특정 entity 에 속하지 않는 오류 메시지를 주고받는 데 씁니다. 관련 항목: [[abapeml_response]]

### RAP response parameter (RAP 응답 매개변수)

RAP handler method 와 saver method 에 암묵적으로 있는 변경(changing) 매개변수이며, BDEF derived type `TYPE RESPONSE FOR` 로 정해집니다. 이름은 `mapped`, `failed`, `reported` 로 미리 정해져 있습니다. 메서드에 따라 시그니처에 셋이 모두 있기도 하고, 일부만 있기도 하고, 하나도 없기도 합니다. RAP BO provider 가 RAP BO consumer 에게 mapping 정보, 오류가 난 데이터 건, 메시지를 알려 줄 때 씁니다. 관련 항목: [[abaptype_response_for]]

### RAP reuse service (RAP 재사용 서비스)

RAP에 기본으로 통합되어 있는 재사용 서비스입니다. RAP change documents 가 그 예입니다.

### RAP runtime engine (RAP 런타임 엔진)

RAP 쿼리와 RAP BO의 사용을 처리하는 처리기입니다. 트랜잭션 없는 사용은 RAP 쿼리 엔진이, 트랜잭션이 있는 사용은 RAP 트랜잭션 엔진이 맡습니다.

### RAP runtime framework (RAP 런타임 프레임워크)

RAP 프레임워크 가운데 ABAP 런타임 프레임워크가 제공하는 부분으로, AS ABAP 바깥이나 ABAP 프로그램에서 RAP business object 를 쓰게 해 줍니다. RAP BO를 비즈니스 서비스로 노출할 때 OData 같은 공개 프로토콜을 다루려고 SAP Gateway 의 구성요소를 끌어들입니다. RAP business object 의 실행 중 동작을 제어하는 데는 SADL을 조율 프레임워크로 씁니다. ABAP 프로그램 안에서 RAP BO에 접근하는 ABAP EML 문도 RAP 런타임 프레임워크의 처리를 일으킵니다.

### RAP save action

RAP save sequence 안에서만 실행할 수 있는 RAP action 입니다. RAP interaction phase 에서 실행하려고 하면 런타임 오류가 납니다. 관련 항목: [[abenbdl_action_onsave]]

### RAP save sequence (RAP 저장 순서)

RAP BO 런타임의 한 부분으로, interaction phase 에서 변경이 적어도 한 번 성공한 뒤에 시작됩니다. transactional buffer 의 데이터를 데이터베이스에 저장합니다. RAP early save phase(이른 저장 단계), RAP late save phase(늦은 저장 단계), RAP 정리 단계 세 단계를 이 순서로 거칩니다.

### RAP saver class (RAP 세이버 클래스)

ABAP behavior pool(ABP)의 CCIMP 인클루드에 있는 지역 클래스로, save sequence 에서 불리는 RAP saver method 를 구현합니다. 관련 항목: [[abenabp_saver_class]]

### RAP saver method (RAP 세이버 메서드)

ABAP behavior pool 의 RAP saver class 에 있는 특별한 메서드로, RAP save sequence 에서 불립니다. saver method 의 이름은 미리 정해져 있어서 바꿀 수 없습니다. 관련 항목: [[abenabp_saver_methods]]

### RAP side effect (RAP side effects)

RAP behavior definition 에 선택으로 넣는 부분입니다. BO 속성들 사이의 의존 관계를 정의해서, 영향을 받는 속성을 사용자 화면에서 다시 불러오게 합니다. entity 동작 본문에 `side effects` 키워드를 써서 시작합니다. 관련 항목: [[abenbdl_side_effects]]

### RAP standard operation for associations (association 용 RAP 표준 작업)

연관 소스에서 연관 대상으로 가는 연관 경로를 따라 표준 동작을 하는 association 용 작업입니다. association 생성(create-by-association)과 association 읽기(read-by-association)가 여기에 듭니다. 관련 항목: [[abenbdl_assoc_stand_ops]]

### RAP state message (RAP 상태 메시지)

RAP response parameter `reported` 에 담기는 메시지 가운데 entity 인스턴스의 상태를 가리키는 메시지입니다. `%state_area` 매개변수로 정의하며, 이 값이 메시지를 알맞은 상태 영역에 배정합니다. draft 를 쓰는 BO에서는 메시지가 가리키는 인스턴스와 함께 저장됩니다. draft 를 쓰는 RAP BO, unmanaged RAP BO의 saver method `cleanup_finalize` 와 `check_before_save`, managed RAP BO의 determination 과 validation 에서 쓰입니다. 관련 항목: [[abapderived_types_state_area]]

### RAP static field characteristic (RAP 정적 필드 특성)

RAP BO entity 인스턴스의 상태와 상관없이 RAP BO 필드의 사용 제한을 정하는 field characteristics 입니다. readonly 와 필수가 정적 field characteristics 의 예입니다.

### RAP static transition message (RAP 정적 전이 메시지)

RAP BO entity 를 가리키지만 특정 인스턴스를 가리키지는 않는 transition message 입니다. RAP 인스턴스 transition message 와 달리 키 참조가 들어 있지 않습니다.

### RAP total ETag (RAP 전체 ETag)

draft 를 쓰는 RAP BO의 필드입니다. draft 가 영구 데이터로 넘어갈 때 낙관적 동시성 확인을 할 수 있게 해 줍니다.

### RAP transaction (RAP 트랜잭션)

데이터를 일관된 한 상태에서 일관된 다른 상태로 옮기는 데 쓰는 모든 작업과 처리 흐름을 합친 것입니다. RAP transactional buffer 에 새 데이터를 만들거나 데이터베이스의 데이터를 transactional buffer 로 가져오면서 시작됩니다. `COMMIT ENTITIES` 또는 `ROLLBACK ENTITIES` 로 끝납니다. 관련 항목: [[abapcommit_entities]], [[abaprollback_entities]]

### RAP transactional buffer (RAP 트랜잭션 버퍼)

RAP 트랜잭션 하나 동안 쓰는 데이터를 두는 저장 공간입니다. 작업 중인 RAP BO 인스턴스가 여기에 들어 있습니다. managed RAP BO의 managed transactional buffer 와 unmanaged RAP BO의 unmanaged transactional buffer 로 나뉩니다.

### RAP transactional engine (RAP 트랜잭션 엔진)

RAP 런타임 엔진 가운데 RAP BO를 트랜잭션으로 사용하는 경우를 처리하는 부분입니다.

### RAP transactional framework (RAP 트랜잭션 프레임워크)

RAP 프레임워크의 한 부분입니다. RAP 트랜잭션 엔진과 RAP business object 개발 환경으로 이루어집니다.

### RAP transactional phase (RAP 트랜잭션 단계)

RAP interaction phase 와 RAP save sequence 를 아울러 RAP 트랜잭션 단계라고 합니다.

### RAP transition message (RAP 전이 메시지)

RAP response parameter `reported` 에 담기는 메시지 가운데, 현재의 ABAP EML `MODIFY` 요청과 뜻이 이어지고 entity 인스턴스의 상태와는 상관없는 메시지입니다. RAP 상태 메시지와 달리 상태 영역(`%state_area`)이 배정되지 않고, 상태와 함께 저장되지도 않습니다. 그래서 나중에 다시 꺼내 볼 수 없습니다. 인스턴스 transition message 와 정적 transition message 가 있습니다. 관련 항목: [[abapeml_response]]

### RAP type mapping

RAP business object 용으로 CDS에 정의한 데이터 모델의 데이터 타입과, BDEF derived type 구성요소의 꼴에 맞지 않는 다른 데이터 타입을 서로 짝짓는 일입니다. 예를 들어 behavior definition 에서 데이터베이스 필드 이름을 CDS 요소 이름에 짝지을 때 씁니다. 관련 항목: [[abenbdl_type_mapping]]

### RAP unlink action (RAP 연결 해제 action)

association 용 RAP non-standard operation 으로, 외래 키 필드의 값을 지워서 서로 연관된 두 RAP BO entity 인스턴스를 떼어 놓습니다. BO 내부 association 과 cross-BO association 모두에 정의할 수 있습니다. RAP 연결 action 도 함께 참고합니다. 관련 항목: [[abenbdl_link_unlink_action]]

### RAP unmanaged draft provider (RAP unmanaged draft 제공자)

draft 를 unmanaged 로 처리하는 BO의 draft provider 입니다. draft 처리를 ABAP behavior pool 에 직접 구현합니다.

### RAP unmanaged query (RAP unmanaged 쿼리)

RAP 쿼리의 구현 유형 가운데 하나입니다. RAP 쿼리 엔진의 일부를 ABAP 클래스에 직접 구현해야 하며, 그 클래스는 CDS custom entity(사용자 정의 엔터티)에서 참조합니다.

### RAP unmanaged save

managed RAP BO의 기본 저장 메서드를 대신하는 저장 로직입니다. behavior definition 머리말에 정의하면 BO 전체에, entity 동작 특성에 정의하면 그 entity 하나에 적용됩니다. 재정의한 saver method `save_modified` 에 구현합니다. 관련 항목: [[abenbdl_saving]], [[abaprap_saver_meth_save_modified]]

### RAP update operation (RAP 수정 작업)

이미 있는 RAP BO entity 인스턴스의 필드 값을 바꾸는 RAP 변경 작업입니다.

### RAP validation

RAP BO 동작에 선택으로 넣는 부분으로, 발동 조건이 맞으면 RAP BO 인스턴스의 일관성을 확인합니다. 관련 항목: [[abenbdl_validations]]

### read-only RAP BO field (readonly RAP BO 필드)

behavior definition 에서 readonly 로 정한 RAP BO 필드입니다. 이 필드는 RAP BO provider 가 로컬 모드에서만 바꿀 수 있습니다. 관련 항목: [[abenbdl_field_char]]

### REST (REST 아키텍처)

Representational State Transfer 의 줄임말로, 웹 서비스의 아키텍처 개념입니다. RESTful 프로그래밍 모델의 핵심 조건 가운데 하나는 상태를 기억하지 않는 웹 서버입니다. 곧 요청과 요청 사이에 클라이언트별 정보를 웹 서버에 저장할 수 없고, 세션 상태는 웹 클라이언트가 관리하면서 필요한 정보를 요청에 모두 실어 보냅니다. 다만 웹 서버가 데이터베이스 같은 영속 계층의 클라이언트가 되어 세션 상태를 거기에 저장할 수는 있으며, ABAP 은 ABAP RAP으로 REST를 지원합니다.

### RESTful (REST 방식)

REST 원칙을 지키는 프로그래밍 모델과 그 서비스, API, 프로토콜을 가리켜 RESTful 하다고 합니다. ABAP RESTful Application Programming Model 도 함께 참고합니다.

### reverse foreign key association (역방향 외래 키 association)

→ **target-resolved association (대상 해석 association)** 를 보세요.

## S

### SADL (서비스 적응 정의 언어)

Service Adaptation Definition Language 의 줄임말입니다. 모델을 바탕으로 데이터를 읽고 처리하는 기반 구조입니다. RAP 런타임 프레임워크는 쿼리 엔진과, RAP business object 의 실행 중 동작을 제어하는 조율 프레임워크에 SADL을 내부적으로 씁니다.

### source-resolved association (소스 해석 association)

외래 키 association(foreign key association)라고도 합니다. 외래 키가 연관 소스 entity 쪽에 저장되는 association 입니다.

### static RAP BO operation (정적 RAP BO 작업)

어느 RAP BO entity 인스턴스에도 묶이지 않고 RAP BO entity 전체에 관계되는 RAP BO 작업입니다. 선택 추가 구문 `static` 으로 정의합니다. 관련 항목: [[abenbdl_static]]

## T

### target-resolved association (대상 해석 association)

역방향 외래 키 association(reverse foreign key association)라고도 합니다. 외래 키가 연관 대상 entity 쪽에 저장되는 association 입니다.

### transactional phase (트랜잭션 단계)

트랜잭션이 지금 어느 단계에 있는지 나타내며, 변경(modify) 단계이거나 저장(save) 단계입니다. RAP handler method 와 saver method 에서처럼 암묵적으로 정해지기도 하고, `CL_ABAP_TX` 클래스의 static 메서드로 명시적으로 정하기도 합니다. RAP 트랜잭션에서 변경 단계는 RAP interaction phase 와 save sequence 의 early save phase 를 아우릅니다. 저장 단계는 RAP late save phase 입니다.

### treeview (트리 뷰)

RAP에서 말하는 트리 뷰는 CDS 계층으로 모델링한 데이터를 눈에 보이게 나타낸 것입니다. 예를 들어 SAP Fiori Elements 의 트리 테이블로 보여 줍니다. readonly 일 수도, 편집할 수 있는 것일 수도 있습니다.

## U

### unmanaged RAP BO provider (unmanaged RAP BO 제공자)

RAP BO provider 가운데 ABAP behavior pool 에 직접 구현해야 하는 부분입니다.

### unmanaged RAP business object (unmanaged RAP 비즈니스 객체)

줄임말 unmanaged RAP BO. RAP BO의 동작을 제공하는 방식 가운데 하나입니다. transactional buffer 는 ABAP behavior implementation 이 제공합니다. 구현 전체를 ABAP behavior pool 에 있는 unmanaged RAP BO provider 가 제공합니다.

### unmanaged transactional buffer (unmanaged 트랜잭션 버퍼)

unmanaged RAP BO의 transactional buffer 입니다. unmanaged RAP BO provider 가 제공하고, 접근도 unmanaged RAP BO provider 가 합니다.

## V

### value help (값 도움말)

→ **input help (입력 도움말)** 를 보세요.

## W

### web API (웹 API)

RAP 비즈니스 서비스를 쓰는 OData 사용자 가운데, 화면(UI)용 메타데이터 없이 API 구실을 하는 것입니다.
